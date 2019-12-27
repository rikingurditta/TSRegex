import NSet from './NSet';

export enum Token { Symbol, Curly, Square, SquareComp, Paren, Repeat, Star, Or, And, Caret, End, Escape }

const metaToToken: { [w: string]: Token } = {
	"{": Token.Curly,
	"}": Token.Curly,
	"[": Token.Square,
	"]": Token.Square,
	"(": Token.Paren,
	")": Token.Paren,
	"?": Token.Repeat,
	"+": Token.Repeat,
	"*": Token.Star,
	"|": Token.Or,
	"^": Token.Caret,
	"$": Token.End,
	"\\": Token.Escape,
}
export const brackets = new NSet<String>(["{", "}", "[", "[^", "]", "(", ")"]);
export const forward = new NSet<String>(["{", "[", "[^", "("]);
const forwardToBack: { [s: string]: string } = {
	"{": "}",
	"[": "]",
	"[^": "]",
	"(": ")",
}


// return an array of pairs of tokens and symbols for the regex string
export function tokenize(w: String): [Token, string][] {
	let out: [Token, string][] = []

	// whether the next character should be escaped
	let escape = false;
	// whether the next characters are inside curly brackets
	let curly = false;
	let curlyInside = '';
	for (let i = 0; i < w.length; i += 1) {
		let s = w.charAt(i)
		if (s in metaToToken && !escape && !curly) {
			// if s is a metacharacter and it should not be escaped,
			// get its token and add it to the list
			if (metaToToken[s] == Token.Escape) {
				escape = true;
			} else if (metaToToken[s] == Token.Curly) {
				curly = true;
			} else {
				out.push([metaToToken[s], s]);
			}
		} else {
			if (curly) {
				if (metaToToken[s] == Token.Curly) {
					curly = false;
					out.push([metaToToken[s], curlyInside]);
					curlyInside = '';
				} else {
					curlyInside += s;
				}
			}
			if (escape && !curly) {
				// if s is not a metacharacter or if it is escaped, add it as a symbol
				out.push([Token.Symbol, s])
				escape = false;
			}
		}
	}
	return reduceComplement(out);
}


// reduce adjacent [ and ^ to [^ in a partially-tokenized regex
// helper function for tokenize
function reduceComplement(lst: [Token, string][]): [Token, string][] {
	let out: [Token, string][] = [];

	let i = 0;
	while (i < lst.length) {
		let currTok = lst[i][0];
		let currStr = lst[i][1];
		let nextTok = null;
		if (i < lst.length - 1) {
			nextTok = lst[i + 1][0];
		}

		if (currTok == Token.Square && currStr == "[" && nextTok == Token.Caret) {
			// if [ and ^ are adjacent, push [^
			out.push([Token.SquareComp, "[^"])
			// skip past the ^
			i += 2;
		} else {
			// otherwise just push the pair as-is
			out.push(lst[i]);
			i += 1;
		}
	}
	return out;
}

let digits: NSet<String> = new NSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

// return whether or not the brackets in the regex are well-formed,
// i.e. all opened brackets are matched and closed, without overlaps,
// and with only digits inside curly brackets
function wellFormedBrackets(s: string): boolean {
	// make sure that only digits are within { }
	let curly = false;
	for (let char of s) {
		if (curly && char == '}') {
			curly = false;
		}
		if (curly && !(digits.has(char) || char == ',')) {
			return false;
		}
		if (!curly && char == '{') {
			curly = true;
		}
	}

	// stack of closed brackets that should be matched
	let stack = [];
	for (let char of s) {
		if (brackets.has(char)) {
			if (forward.has(char)) {
				// push the matching close bracket to the stack
				stack.push(forwardToBack[char]);
			} else {
				// if the current close bracket is not the same as the one at
				// the top of the stack, then the brackets are not well-formed
				if (stack.pop() != char) {
					return false;
				}
			}
		}
	}
	// the stack should be empty at the end
	return stack.length == 0;
}

// console.log(wellFormedBrackets('a{1,2}'));
// console.log(tokenize('a{1,2}b{3,3}'));
