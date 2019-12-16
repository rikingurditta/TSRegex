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
var Lexical_1 = require("./Lexical");
var Regex_1 = require("./Regex");
// turns list of token-value pairs into Regex object
function buildTree(lst) {
    // bottom-up parsing
    var curr = lst;
    curr = reduceSymbol(curr);
    curr = reduceSequence(curr);
    return null;
}
// reduces symbols into RESymbols
function reduceSymbol(lst) {
    var e_1, _a;
    var out = [];
    try {
        for (var lst_1 = __values(lst), lst_1_1 = lst_1.next(); !lst_1_1.done; lst_1_1 = lst_1.next()) {
            var x = lst_1_1.value;
            if ((x instanceof Array) && (x[0] == Lexical_1.Token.Symbol)) {
                out.push(new Regex_1.RESymbol(x[1]));
            }
            else {
                out.push(x);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (lst_1_1 && !lst_1_1.done && (_a = lst_1["return"])) _a.call(lst_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return out;
}
// reduces sequences of Regexes into a concatenation
function reduceSequence(lst) {
    var out = [];
    var i = 0;
    while (i < lst.length) {
        if (lst[i] instanceof Regex_1.Regex) {
            var j = i;
            while (j < lst.length && lst[j] instanceof Regex_1.Regex) {
                j += 1;
            }
            if (j > 1) {
                out.push(new Regex_1.RESequence(lst.slice(i, j)));
            }
            else {
                out.push(lst[i]);
            }
            i += j;
        }
        else {
            out.push(lst[i]);
            i += 1;
        }
    }
    return out;
}
