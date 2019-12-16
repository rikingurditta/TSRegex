"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var NFA_1 = require("./NFA");
// abstract class for parsed regular expressions
var Regex = /** @class */ (function () {
    function Regex() {
    }
    // get the NFA which accepts the strings matched by this regex
    Regex.prototype.getNFA = function () {
        throw new Error('Not implemented!');
    };
    return Regex;
}());
exports.Regex = Regex;
// parsed regular expression for a single symbol
var RESymbol = /** @class */ (function (_super) {
    __extends(RESymbol, _super);
    // create a new symbol regex
    function RESymbol(symbol) {
        var _this = _super.call(this) || this;
        if (symbol.length != 1) {
            throw Error("Not a symbol!");
        }
        _this.symbol = symbol;
        return _this;
    }
    // get the NFA which accepts this regex's symbol 
    RESymbol.prototype.getNFA = function () {
        var reject = new NFA_1.NFAState(this.symbol + "0", {}, false);
        var accept = new NFA_1.NFAState(this.symbol + "1", {}, true);
        reject.addTransition(this.symbol, accept);
        var states = new NSet_1["default"]([reject, accept]);
        return new NFA_1.NFA(reject, states);
    };
    return RESymbol;
}(Regex));
exports.RESymbol = RESymbol;
// parsed regular expression for a sequence of regexes
var RESequence = /** @class */ (function (_super) {
    __extends(RESequence, _super);
    // create a new sequence of regexes
    function RESequence(reList) {
        var _this = _super.call(this) || this;
        _this.subs = reList;
        return _this;
    }
    // get the NFA which accepts this sequence of regexes
    RESequence.prototype.getNFA = function () {
        if (this.subs.length == 0) {
            var s = new NFA_1.NFAState("empty sequence", {}, true);
            return new NFA_1.NFA(s, new NSet_1["default"]([s]));
        }
        // concatenate all NFAs in order to make NFA which accepts sequence
        var start = this.subs[0].getNFA();
        for (var i = 1; i < this.subs.length; i += 1) {
            start.append(this.subs[i].getNFA());
        }
        return start;
    };
    return RESequence;
}(Regex));
exports.RESequence = RESequence;
// parsed regular expression for applying {num} to a regex,
// aka repeating a regex num times
var RERepeat = /** @class */ (function (_super) {
    __extends(RERepeat, _super);
    // create a new repeat regex
    function RERepeat(regex, num) {
        var _this = _super.call(this) || this;
        _this.inside = regex;
        _this.num = num;
        return _this;
    }
    // get the NFA which accepts num repetitions of the inside regex
    RERepeat.prototype.getNFA = function () {
        var reList = [];
        for (var i = 0; i < this.num; i += 1) {
            reList.push(this.inside);
        }
        return new RESequence(reList).getNFA();
    };
    return RERepeat;
}(Regex));
exports.RERepeat = RERepeat;
// parsed regular expression for applying * to a regex, aka repeating it
// an arbitrary number of times
var REStar = /** @class */ (function (_super) {
    __extends(REStar, _super);
    // create a new star regex
    function REStar(regex) {
        var _this = _super.call(this) || this;
        _this.inside = regex;
        return _this;
    }
    // get the NFA which accepts arbitrary repetitions of the inside regex
    REStar.prototype.getNFA = function () {
        var e_1, _a;
        var start = new NFA_1.NFAState("*start", {}, true);
        var out = new NFA_1.NFA(start, new NSet_1["default"]([start]));
        var insideNFA = this.inside.getNFA();
        try {
            for (var _b = __values(insideNFA.getAcceptingStates()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var state = _c.value;
                state.addTransition(NFA_1.EPSILON, insideNFA.start);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        out.append(insideNFA);
        return out;
    };
    return REStar;
}(Regex));
exports.REStar = REStar;
// parsed regular expression for applying * to a regex
var REPlus = /** @class */ (function (_super) {
    __extends(REPlus, _super);
    // create a new star regex
    function REPlus(regex) {
        var _this = _super.call(this) || this;
        _this.inside = regex;
        return _this;
    }
    // get the NFA which accepts arbitrary repetitions of the inside regex
    REPlus.prototype.getNFA = function () {
        return new RESequence([this.inside, new REStar(this.inside)]).getNFA();
    };
    return REPlus;
}(Regex));
exports.REPlus = REPlus;
