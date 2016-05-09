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
        return fn(raw, pos, options.metadata);
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
