import NSet from "./NSet";
import {EPSILON, NFAState, NFA} from "./NFA";


// abstract class for parsed regular expressions
export class Regex {
	// get the NFA which accepts the strings matched by this regex
	getNFA(): NFA {
		throw new Error('Not implemented!');
	}
}


// parsed regular expression for a single symbol
export class RESymbol extends Regex {
	symbol: string;

	// create a new symbol regex
	constructor(symbol) {
		super();
		if (symbol.length != 1) {
			throw Error("Not a symbol!");
		}
		this.symbol = symbol;
	}

	// get the NFA which accepts this regex's symbol 
	getNFA(): NFA {
		let reject = new NFAState(this.symbol + "0", {}, false);
		let accept = new NFAState(this.symbol + "1", {}, true);
		reject.addTransition(this.symbol, accept);
		let states = new NSet<NFAState>([reject, accept])
		return new NFA(reject, states);
	}
}


// parsed regular expression for a sequence of regexes
export class REConcat extends Regex {
	// the regexes to be concatenated
	subs: Regex[]

	// create a new sequence of regexes
	constructor(reList) {
		super();
		this.subs = reList;
	}

	// get the NFA which accepts this sequence of regexes
	getNFA(): NFA {
		if (this.subs.length == 0) {
			let s = new NFAState("empty sequence", {}, true);
			return new NFA(s, new NSet([s]));
		}
		// concatenate all NFAs in order to make NFA which accepts sequence
		let start = this.subs[0].getNFA();
		for (let i = 1; i < this.subs.length; i += 1) {
			start.append(this.subs[i].getNFA());
		}
		return start;
	}
}


// parsed regular expression for applying {num} to a regex,
// aka repeating a regex num times
export class RERepeat extends Regex {
	// the regex to be repeated
	inside: Regex;
	// how many times it should be repeated
	num: number;

	// create a new repeat regex
	constructor(regex, num) {
		super();
		this.inside = regex;
		this.num = num;
	}

	// get the NFA which accepts num repetitions of the inside regex
	getNFA(): NFA {
		let reList = [];
		for (let i = 0; i < this.num; i += 1) {
			reList.push(this.inside);
		}
		return new REConcat(reList).getNFA();
	}
}


// parsed regular expression for applying * to a regex, aka repeating it
// an arbitrary number of times
export class REStar extends Regex {
	// the regex to be repeated
	inside: Regex;

	// create a new star regex
	constructor(regex) {
		super();
		this.inside = regex;
	}


	// get the NFA which accepts arbitrary repetitions of the inside regex
	getNFA(): NFA {
		let start = new NFAState("*start", {}, true);
		let out = new NFA(start, new NSet([start]));
		let insideNFA = this.inside.getNFA();
        for (let state of insideNFA.getAcceptingStates()) {
			state.addTransition(EPSILON, insideNFA.start);
		}
		out.append(insideNFA);
		return out;
	}
}


// parsed regular expression for applying * to a regex
export class REPlus extends Regex {
	// the regex to be repeated
	inside: Regex;

	// create a new star regex
	constructor(regex) {
		super();
		this.inside = regex;
	}


	// get the NFA which accepts arbitrary repetitions of the inside regex
	getNFA(): NFA {
		return new REConcat([this.inside, new REStar(this.inside)]).getNFA();
	}
}

globalThis.RESymbol = RESymbol;
globalThis.REConcat = REConcat;
