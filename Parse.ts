import { Token, brackets, forward, tokenize } from './Lexical'
import { Regex, RESymbol, REConcat, RERepeat, REStar, REPlus } from './Regex'


// partially-parsed tree - list of Regexes and token-value pairs
// is fully parsed when completely reduced to a list of a single Regex
type ParseTree = Array<Regex | [Token, string]>;


// turns list of token-value pairs into Regex object
function buildTree(lst: [Token, string][]): Regex {
	// bottom-up parsing
	let curr: ParseTree = lst;
	curr = reduceSymbol(curr);
	curr = reduceSequence(curr);
	return null;
}


// reduces symbols into RESymbols
function reduceSymbol(lst: ParseTree): ParseTree {
	let out: ParseTree = [];
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
function reduceSequence(lst: ParseTree): ParseTree {
	let out: ParseTree = [];
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
				out.push(new REConcat(lst.slice(i, count)));
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