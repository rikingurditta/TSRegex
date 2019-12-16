import { Token, brackets, forward, tokenize } from './Lexical'
import { Regex, RESymbol, RESequence, RERepeat, REStar, REPlus } from './Regex'


// turns list of token-value pairs into Regex object
function buildTree(lst: [Token, string][]): Regex {
	// bottom-up parsing
	let curr: Array<Regex | [Token, string]> = lst;
	curr = reduceSymbol(curr);
	curr = reduceSequence(curr);
	return null;
}


// reduces symbols into RESymbols
function reduceSymbol(lst: Array<Regex | [Token, string]>): Array<Regex | [Token, string]> {
	let out: Array<Regex | [Token, string]> = [];
	for (let x of lst) {
		if ((x instanceof Array) && (x[0] == Token.Symbol)) {
			out.push(new RESymbol(x[1]));
		} else {
			out.push(x);
		}
	}
	return out;
}


// reduces sequences of Regexes into a concatenation
function reduceSequence(lst: Array<Regex | [Token, string]>): Array<Regex | [Token, string]> {
	let out: Array<Regex | [Token, string]> = [];
	let i = 0;
	while (i < lst.length) {
		if (lst[i] instanceof Regex) {
			let j = i;
			while (j < lst.length && lst[j] instanceof Regex) {
				j += 1;
			}
			if (j > 1) {
				out.push(new RESequence(lst.slice(i, j)));
			} else {
				out.push(lst[i]);
			}
			i += j;
		} else {
			out.push(lst[i]);
			i += 1;
		}
	}
	return out;
}