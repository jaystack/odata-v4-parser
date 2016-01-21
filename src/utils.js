"use strict";
function stringify(value, index, next) {
    return Array.prototype.map.call(value.slice(index, next), function (ch) { return String.fromCharCode(ch); }).join('');
}
exports.stringify = stringify;
function is(value, compare) {
    for (var i = 0; i < compare.length; i++) {
        if (value == compare.charCodeAt(i))
            return true;
    }
    return false;
}
exports.is = is;
function equals(value, index, compare) {
    var i = 0;
    while (value[index + i] == compare.charCodeAt(i) && i < compare.length) {
        i++;
    }
    return i == compare.length ? i : 0;
}
exports.equals = equals;
function required(value, index, comparer, min, max) {
    var i = 0;
    max = max || (value.length - index);
    while (i < max && comparer(value[index + i])) {
        i++;
    }
    return i >= (min || 0) && i <= max ? index + i : 0;
}
exports.required = required;
