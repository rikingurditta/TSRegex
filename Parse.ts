import { Token, brackets, forward, tokenize } from './Lexical'
import { Regex, RESymbol, REConcat, RERepeat, REStar, REPlus, REOr } from './Regex'


// partially-parsed tree - list of Regexes and token-value pairs
// is fully parsed when completely reduced to a list of a single Regex
type Pair = [Token, string];
type ParseList = Array<Regex | Pair>;


// turns list of token-value pairs into Regex object
function buildTree(lst: Pair[]): Regex {
	// bottom-up parsing
	let curr: ParseList = lst;
	curr = reduceSymbol(curr);
	curr = reduceSquare(curr);
	curr = reduceRepeat(curr);
	curr = reduceSequence(curr);
	return <Regex> curr[0];
}


// reduces symbols into RESymbols
function reduceSymbol(lst: ParseList): ParseList {
	let out: ParseList = [];
	for (let x of lst) {
		if ((x instanceof Array) && (x[0] == Token.Symbol)) {
			// if item's token is Symbol, convert to Regex for the symbol
			out.push(new RESymbol(x[1]));
		} else {
			// ignore all other objects
			out.push(x);
		}
	}
	return out;
}


/*
 * Reduces square brackets, i.e. optionals
 * Assumes that everything inside square brackets is a Regex
 */
function reduceSquare(lst: ParseList): ParseList {
	let out: ParseList = [];
	let square = false;
	let currSquare = [];
	for (let x of lst) {
		if (x instanceof Array && x[0] == Token.Square) {
			// toggle square flag
			if (x[1] == '[') {
				square = true;
			} else {
				square = false;
				if (currSquare != []) {
					out.push(new REOr(currSquare));
				}
			}
			currSquare = [];
		} else if (square) {  // if square flag is on, push to square contents
			currSquare.push(x);
		} else {
			out.push(x);
		}
	}
	return out;
}


// reduces sequences of Regexes into a concatenation
// TODO: update to not concatenate symbols within []
function reduceSequence(lst: ParseList): ParseList {
	let out: ParseList = [];
	// need manual iteration because need multiple indices
	let i = 0;
	let square = false;
	while (i < lst.length) {
		if (lst[i] instanceof Array) {
			let tok = lst[i][0];
			let str = lst[i][1];
			if (tok == Token.Square && str == '[' || tok == Token.SquareComp)
				square = true;
			else if (tok = Token.Square && str == ']')
				square = false;
		}
		if (lst[i] instanceof Regex && !square) {  // if a [ has not been closed, do nothing
			// count how many regexes are adjacent
			let count = 0;
			while (i + count < lst.length && lst[i + count] instanceof Regex)
				count += 1;

			if (count > 1) {
				// if there are more than one adjacent regex, concatenate them
				out.push(new REConcat(<Regex[]>lst.slice(i, i + count)));
			} else {
				// no need to concatenate only one regex
				out.push(lst[i]);
			}
			i += count;
		} else {
			// ignore non-regex objects
			out.push(lst[i]);
			i += 1;
		}
	}
	return out;
}


// reduces a regex followed by a repeat specification into an RERepeat object
function reduceRepeat(lst: ParseList): ParseList {
	let out: ParseList = [];
	let i = 0;
	let prev = null;  // keep track of previous list item
	while (i < lst.length) {
		if (prev instanceof Regex && lst[i] instanceof Array) {
			let tok = lst[i][0];
			let str = lst[i][1];
			if (tok == Token.Curly) {
				out.pop();  // remove prev item, replace with appropriately repeated prev
				out.push(new RERepeat(prev, parseCurlyNums(str)[0], parseCurlyNums(str)[1]))
			} else if (tok == Token.Repeat) {
				out.pop();  // remove prev item, replace with appropriately repeated prev
				if (str == '?') {
					// x? = epsilon or x
					out.push(new RERepeat(prev, 0, 1));
				} else if (str == '+') {
					// x+ = xx*
					out.push(new REPlus(prev));
				}
			}
		} else {
			out.push(lst[i]);
		}
		prev = lst[i];
		i += 1;
	}
	return out;
}

// parse the
function parseCurlyNums(str: string): [number, number] {
	let x = str.split(',');
	if (x.length == 0) {
		return [0, 0]
	} else if (x.length == 1) {
		return [parseInt(x[0]), parseInt(x[0])];
	} else {
		return [parseInt(x[0]), parseInt(x[1])]
	}
}

let r = buildTree(tokenize("abc[abc]d?"));
console.log(r);
console.log(r.getNFA().checkString("abcc"));
console.log(r.getNFA().checkString("abccd"));

// let s = buildTree(tokenize("s?"));
// console.log(s);
// console.log(s.getNFA());
// console.log(s.getNFA().checkString(""));
// console.log(s.getNFA().checkString("s"));
// console.log(s.getNFA().checkString("ss"));

// let t = new RERepeat(new RESymbol("a"), 0, 1);
// console.log(t);
// console.log(t.getNFA());
// console.log(t.getNFA().checkString(""));
// console.log(t.getNFA().checkString("a"));