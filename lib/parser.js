"use strict";
var PrimitiveLiteral = require('./primitiveLiteral');
var Expressions = require('./expressions');
var Query = require('./query');
var ResourcePath = require('./resourcePath');
var ODataUri = require('./odataUri');
var parserFactory = function (fn) {
    return function (source, options) {
        options = options || {};
        var raw = new Uint8Array(source.length);
        var pos = 0;
        for (var i = 0; i < source.length; i++) {
            raw[i] = source.charCodeAt(i);
        }
        var result = fn(raw, pos, options.metadata);
        if (!result)
            throw new Error('Fail at ' + pos);
        if (result.next < raw.length)
            throw new Error('Unexpected character at ' + result.next);
        return result;
        /*while (pos < raw.length) {
            var token = fn(raw, pos, options.metadata);
            if (token) {
                pos = token.next;
                tokens.push(token);
            } else {
                throw new Error('Fail at ' + pos);
            }
        }
        return tokens.length > 1 ? tokens : tokens[0];*/
    };
};
var Parser = (function () {
    function Parser() {
    }
    Parser.prototype.odataUri = function (source, options) { return parserFactory(ODataUri.odataUri)(source, options); };
    Parser.prototype.resourcePath = function (source, options) { return parserFactory(ResourcePath.resourcePath)(source, options); };
    Parser.prototype.query = function (source, options) { return parserFactory(Query.queryOptions)(source, options); };
    Parser.prototype.filter = function (source, options) { return parserFactory(Expressions.boolCommonExpr)(source, options); };
    Parser.prototype.keys = function (source, options) { return parserFactory(Expressions.keyPredicate)(source, options); };
    Parser.prototype.literal = function (source, options) { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options); };
    return Parser;
}());
exports.Parser = Parser;
function odataUri(source, options) { return parserFactory(ODataUri.odataUri)(source, options); }
exports.odataUri = odataUri;
function resourcePath(source, options) { return parserFactory(ResourcePath.resourcePath)(source, options); }
exports.resourcePath = resourcePath;
function query(source, options) { return parserFactory(Query.queryOptions)(source, options); }
exports.query = query;
function filter(source, options) { return parserFactory(Expressions.boolCommonExpr)(source, options); }
exports.filter = filter;
function keys(source, options) { return parserFactory(Expressions.keyPredicate)(source, options); }
exports.keys = keys;
function literal(source, options) { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options); }
exports.literal = literal;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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
