import { Token, brackets, forward, tokenize } from './Lexical'
import { Regex, RESymbol, REConcat, RERepeat, REStar, REPlus } from './Regex'


// partially-parsed tree - list of Regexes and token-value pairs
// is fully parsed when completely reduced to a list of a single Regex
type Pair = [Token, string];
type ParseList = Array<Regex | Pair>;


// turns list of token-value pairs into Regex object
function buildTree(lst: Pair[]): Regex {
	// bottom-up parsing
	let curr: ParseList = lst;
	curr = reduceSymbol(curr);
	curr = reduceSequence(curr);
	return null;
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


// reduces sequences of Regexes into a concatenation
// TODO: update to not concatenate symbols within []
function reduceSequence(lst: ParseList): ParseList {
	let out: ParseList = [];
	// need manual iteration because need multiple indices
	let i = 0;
	while (i < lst.length) {
		if (lst[i] instanceof Regex) {
			// count how many regexes are adjacent
			let count = i;
			while (count < lst.length && lst[count] instanceof Regex) {
				count += 1;
			}
			if (count > 1) {
				// if there are more than one adjacent regex, concatenate them
				out.push(new REConcat(<Regex[]>lst.slice(i, count)));
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
	let prev = null;
	while (i < lst.length) {
		if (prev instanceof Regex && lst[i] instanceof Array && lst[i][0] == Token.Curly) {
			let currTok = lst[i][0];
			let currStr = lst[i][1];
			out.pop();
			out.push(new RERepeat(prev, parseCurlyNums(currStr)[0], parseCurlyNums(currStr)[1]))
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


// console.log(reduceRepeat([new RESymbol('a'), [Token.Curly, '10,200']]))
