"use strict";
var PrimitiveLiteral = require('./primitiveLiteral');
var Expressions = require('./expressions');
var Query = require('./query');
var ResourcePath = require('./resourcePath');
var ODataUri = require('./odataUri');
var parserFactory = function (fn) {
    return function (source, options) {
        var raw = new Uint8Array(source.length);
        var pos = 0;
        var tokens = [];
        for (var i = 0; i < source.length; i++) {
            raw[i] = source.charCodeAt(i);
        }
        while (pos < raw.length) {
            var token = fn(raw, pos);
            if (token) {
                pos = token.next;
                tokens.push(token);
            }
            else {
                throw new Error('Fail at ' + pos);
            }
        }
        return tokens.length > 1 ? tokens : tokens[0];
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
//# sourceMappingURL=parser.js.map