"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var NSet_1 = require("./NSet");
// the empty string, used for epsilon transitions
exports.EPSILON = "";
// A class for a state in a nondeterministic finite automaton
var NFAState = /** @class */ (function () {
    // create a new state, which is either accepting or non-accepting
    function NFAState(name, transitionDict, accepting) {
        this.name = name;
        this.transitionDict = transitionDict;
        this.accepting = accepting;
    }
    // return the states that are reached by transitioning based on symbol
    NFAState.prototype.transition = function (symbol) {
        if (!(symbol in this.transitionDict)) {
            this.transitionDict[symbol] = new NSet_1["default"]();
        }
        return this.transitionDict[symbol];
    };
    // return whether or not this state is accepting
    NFAState.prototype.result = function () {
        return this.accepting;
    };
    // add a transition rule for this state
    NFAState.prototype.addTransition = function (symbol, state) {
        if (symbol in this.transitionDict) {
            this.transitionDict[symbol].add(state);
        }
        else {
            this.transitionDict[symbol] = new NSet_1["default"]([state]);
        }
    };
    return NFAState;
}());
exports.NFAState = NFAState;
// a class for a nondeterministic finite automaton
var NFA = /** @class */ (function () {
    // create a new NFA, whose starting state is start
    function NFA(start, states) {
        this.start = start;
        this.states = states;
    }
    // check if an accept state is reached by this NFA after transitioning based on w
    NFA.prototype.checkString = function (w) {
        // return whether or not w is accepted
        var currentStates = new NSet_1["default"]([this.start]);
        // do initial epsilon transitions get to all starting states
        currentStates = NFA.doAllEpsilonTransitions(currentStates);
        var nextStates = new NSet_1["default"]();
        for (var i = 0; i < w.length; i += 1) {
            // transition based on current symbol
            nextStates = NFA.transitionStates(currentStates, w[i]);
            // add epsilon transition for current states to nextStates
            nextStates.addAll(NFA.transitionStates(currentStates, exports.EPSILON));
            // do all possible epsilon transitions
            nextStates = NFA.doAllEpsilonTransitions(nextStates);
            currentStates = nextStates;
            // console.log(w[i], NFA.stateNames(currentStates));
        }
        // console.log(NFA.stateNames(currentStates));
        // if any state is an accepting state, then the NFA accepts the string
        var accepting = false;
        currentStates.forEach(function (state) {
            if (state.result()) {
                accepting = true;
            }
        });
        return accepting;
    };
    // transition all states in given set based on given symbol
    NFA.transitionStates = function (states, symbol) {
        // return set of states reached
        var nextStates = new NSet_1["default"]();
        states.forEach(function (state) { return nextStates.addAll(state.transition(symbol)); });
        return nextStates;
    };
    // do epsilon transitions until no new state is reached
    NFA.doAllEpsilonTransitions = function (states) {
        // return states (arg) as well as all states reached by doing all possible epsilon transitions
        // does not mutate states
        // e.g. if the NFA is qO -e-> q1 -e-> q2 and states is {q0}, return {q0, q1, q2}
        var tempStates = new NSet_1["default"]();
        while (!tempStates.equals(states)) {
            tempStates = states;
            states = states.union(NFA.transitionStates(states, exports.EPSILON));
        }
        return states;
    };
    // return set with names of states
    NFA.stateNames = function (states) {
        var names = new NSet_1["default"]();
        states.forEach(function (state) { return names.add(state.name); });
        return names;
    };
    // return set with names of all states in this NFA
    NFA.prototype.getStateNames = function () {
        return NFA.stateNames(this);
    };
    // return set of all accepting states in this NFA
    NFA.prototype.getAcceptingStates = function () {
        var e_1, _a;
        var out = new NSet_1["default"]();
        try {
            for (var _b = __values(this.states), _c = _b.next(); !_c.done; _c = _b.next()) {
                var state = _c.value;
                if (state.result()) {
                    out.add(state);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return out;
    };
    // mutating append function
    NFA.prototype.append = function (other) {
        // "concatenates" the NFAs, aka makes the accepting states of this
        // lead to the starting state of other
        this.getAcceptingStates().forEach(function (state) {
            state.accepting = false;
            state.addTransition(exports.EPSILON, other.start);
        });
        this.states.addAll(other.states);
    };
    return NFA;
}());
exports.NFA = NFA;
