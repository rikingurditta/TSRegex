enum Token { Symbol, Curly, Square, SquareComp, Paren, Repeat, Or, And, Caret, End, Escape }

const metaToToken: { [w: string]: Token } = {
	"{": Token.Curly,
	"}": Token.Curly,
	"[": Token.Square,
	"]": Token.Square,
	"(": Token.Paren,
	")": Token.Paren,
	"?": Token.Square,
	"+": Token.Repeat,
	"*": Token.Repeat,
	"|": Token.Or,
	"^": Token.Caret,
	"$": Token.End,
	"\\": Token.Escape,
}
const brackets = new Set<Token>([Token.Curly, Token.Square, Token.SquareComp, Token.Paren])
const forward = new Set<String>(["{", "[", "[^", "("]);
const forwardToBack: { [s: string]: string } = {
	"{": "}",
	"[": "]",
	"[^": "]",
	"(": ")",
}


// return an array of pairs of tokens and symbols for the regex string
function tokenize(w: String): [Token, string][] {
	let out: [Token, string][] = []

	// whether the next character should be escaped
	let escape = false;
	for (let i = 0; i < w.length; i += 1) {
		let s = w.charAt(i)
		if (s in metaToToken && !escape) {
			// if s is a metacharacter and it should not be escaped,
			// get its token and add it to the list
			if (metaToToken[s] == Token.Escape) {
				escape = true;
			}
			out.push([metaToToken[s], s]);
		} else {
			// if s is not a metacharacter or if it is escaped, add it as a symbol
			out.push([Token.Symbol, s])
			escape = false;
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


// return whether or not the brackets in the tokenized regex are well-formed,
// i.e. all opened brackets are matched and closed, without overlaps
function wellFormedBrackets(lst: [Token, string][]): boolean {
	// stack of closed brackets that should be matched
	let stack = [];

	for (let pair of lst) {
		let tok = pair[0];
		let str = pair[1];

		if (brackets.has(tok)) {
			if (forward.has(str)) {
				// push the matching close bracket to the stack
				stack.push(forwardToBack[pair[1]]);
			} else {
				// if the current close bracket is not the same as the one at
				// the top of the stack, then the brackets are not well-formed
				if (stack.pop() != str) {
					return false;
				}
			}
		}
	}
	// the stack should be empty at the end
	return stack.length == 0;
}
