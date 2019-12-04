// example NFA, which accepts /1*(0011*|011*)*/
let q0 = new NFAState("q0", {}, true);
let q1 = new NFAState("q1", {}, false);
let q2 = new NFAState("q2", {}, false);
q0.addTransition("0", q1);
q0.addTransition("1", q0);
q0.addTransition(EPSILON, q1);
q1.addTransition("0", q2);
q1.addTransition("1", q1);
q2.addTransition("1", q0);
let nfa = new NFA(q0, new NSet([q0, q1, q2]));

console.log(nfa.checkString("1") + " should be true");
console.log(nfa.checkString("1001111111011") + " should be true");
console.log(nfa.checkString("101101110010011001") + " should be true");
console.log(nfa.checkString("100100") + " should be false");
console.log(nfa.checkString("100100011") + " should be false");


// example of appending NFAs
// accepts "01+"
let a0 = new NFAState("a0", {}, false);
let a1 = new NFAState("a1", {}, false);
let a2 = new NFAState("a2", {}, true);
a0.addTransition("0", a1);
a1.addTransition("1", a2);
a2.addTransition("1", a2);
let a = new NFA(a0, new NSet([a0, a1, a2]));

// accepts "x+y"
let b0 = new NFAState("b0", {}, false);
let b1 = new NFAState("b1", {}, false);
let b2 = new NFAState("b2", {}, true);
b0.addTransition("x", b0);
b0.addTransition("x", b1);
b1.addTransition("y", b2);
let b = new NFA(b0, new NSet([b0, b1, b2]));

a.append(b);
console.log(a.checkString("01xy") + " should be true");
console.log(a.checkString("011xy") + " should be true");
console.log(a.checkString("011xxxxy") + " should be true");
console.log(a.checkString("01") + " should be false");
console.log(a.checkString("xy") + " should be false");
console.log(a.checkString("0xxy") + " should be false");
console.log(a.checkString("011y") + " should be false");
console.log(a.checkString("011yy") + " should be false");
console.log(a.checkString("011yy") + " should be false");
