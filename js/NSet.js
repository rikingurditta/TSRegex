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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
// extending the functionality of the builtin Set
var NSet = /** @class */ (function (_super) {
    __extends(NSet, _super);
    function NSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // check if two sets are equal, i.e. they have the same elements
    NSet.prototype.equals = function (set2) {
        var e_1, _a, e_2, _b;
        if (this.size != set2.size) {
            return false;
        }
        try {
            for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                var item = _d.value;
                if (!set2.has(item)) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        ;
        var set1 = this;
        try {
            for (var set2_1 = __values(set2), set2_1_1 = set2_1.next(); !set2_1_1.done; set2_1_1 = set2_1.next()) {
                var item = set2_1_1.value;
                if (!this.has(item)) {
                    return false;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (set2_1_1 && !set2_1_1.done && (_b = set2_1["return"])) _b.call(set2_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return true;
    };
    // return a new set with all the elements from both sets
    NSet.prototype.union = function (set2) {
        return new NSet(__spread(this, set2));
    };
    // mutate this set to add all elements of set2
    NSet.prototype.addAll = function (set2) {
        var _this = this;
        var set1 = this;
        set2.forEach(function (item) { return _this.add(item); });
    };
    return NSet;
}(Set));
exports["default"] = NSet;
