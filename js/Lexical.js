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
var Token;
(function (Token) {
    Token[Token["Symbol"] = 0] = "Symbol";
    Token[Token["Curly"] = 1] = "Curly";
    Token[Token["Square"] = 2] = "Square";
    Token[Token["SquareComp"] = 3] = "SquareComp";
    Token[Token["Paren"] = 4] = "Paren";
    Token[Token["Repeat"] = 5] = "Repeat";
    Token[Token["Star"] = 6] = "Star";
    Token[Token["Or"] = 7] = "Or";
    Token[Token["And"] = 8] = "And";
    Token[Token["Caret"] = 9] = "Caret";
    Token[Token["End"] = 10] = "End";
    Token[Token["Escape"] = 11] = "Escape";
})(Token = exports.Token || (exports.Token = {}));
var metaToToken = {
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
    "\\": Token.Escape
};
exports.brackets = new Set([Token.Curly, Token.Square, Token.SquareComp, Token.Paren]);
exports.forward = new Set(["{", "[", "[^", "("]);
var forwardToBack = {
    "{": "}",
    "[": "]",
    "[^": "]",
    "(": ")"
};
// return an array of pairs of tokens and symbols for the regex string
// TODO: properly tokenize numbers inside curlies aka xyz{3,5}
function tokenize(w) {
    var out = [];
    // whether the next character should be escaped
    var escape = false;
    for (var i = 0; i < w.length; i += 1) {
        var s = w.charAt(i);
        if (s in metaToToken && !escape) {
            // if s is a metacharacter and it should not be escaped,
            // get its token and add it to the list
            if (metaToToken[s] == Token.Escape) {
                escape = true;
            }
            out.push([metaToToken[s], s]);
        }
        else {
            // if s is not a metacharacter or if it is escaped, add it as a symbol
            out.push([Token.Symbol, s]);
            escape = false;
        }
    }
    return reduceComplement(out);
}
exports.tokenize = tokenize;
// reduce adjacent [ and ^ to [^ in a partially-tokenized regex
// helper function for tokenize
function reduceComplement(lst) {
    var out = [];
    var i = 0;
    while (i < lst.length) {
        var currTok = lst[i][0];
        var currStr = lst[i][1];
        var nextTok = null;
        if (i < lst.length - 1) {
            nextTok = lst[i + 1][0];
        }
        if (currTok == Token.Square && currStr == "[" && nextTok == Token.Caret) {
            // if [ and ^ are adjacent, push [^
            out.push([Token.SquareComp, "[^"]);
            // skip past the ^
            i += 2;
        }
        else {
            // otherwise just push the pair as-is
            out.push(lst[i]);
            i += 1;
        }
    }
    return out;
}
// return whether or not the brackets in the tokenized regex are well-formed,
// i.e. all opened brackets are matched and closed, without overlaps
function wellFormedBrackets(lst) {
    var e_1, _a;
    // stack of closed brackets that should be matched
    var stack = [];
    try {
        for (var lst_1 = __values(lst), lst_1_1 = lst_1.next(); !lst_1_1.done; lst_1_1 = lst_1.next()) {
            var pair = lst_1_1.value;
            var tok = pair[0];
            var str = pair[1];
            if (exports.brackets.has(tok)) {
                if (exports.forward.has(str)) {
                    // push the matching close bracket to the stack
                    stack.push(forwardToBack[pair[1]]);
                }
                else {
                    // if the current close bracket is not the same as the one at
                    // the top of the stack, then the brackets are not well-formed
                    if (stack.pop() != str) {
                        return false;
                    }
                }
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
    // the stack should be empty at the end
    return stack.length == 0;
}
