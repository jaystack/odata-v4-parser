var PrimitiveLiteral = require('./primitiveLiteral');
var Expressions = require('./expressions');
var odata_metadata_1 = require('odata-metadata');
var parserFactory = function (fn) {
    return function (source, options, metadata) {
        var raw = new Uint8Array(source.length);
        var pos = 0;
        var tokens = [];
        for (var i = 0; i < source.length; i++) {
            raw[i] = source.charCodeAt(i);
        }
        while (pos < raw.length) {
            var token = fn(raw, pos, metadata);
            if (token) {
                pos = token.next;
                tokens.push(token);
            }
            else {
                pos++;
            }
        }
        return tokens.length > 1 ? tokens : tokens[0];
    };
};
/*function crawler(source, destination){
    for (var prop in source){
        if (prop != 'parent' && source.hasOwnProperty(prop)){
            if (Array.isArray(source[prop])){
                source[prop].forEach(function(it){
                    if (typeof it == 'object' && it){
                        var name = Object.getPrototypeOf(it).constructor.name;
                        console.log('=>', name);
                        if (!destination[name]) destination[name] = {};
                        destination[name][it.name] = it;
                        crawler(it, destination);
                    }
                });
            }else if (typeof source[prop] == 'object' && source[prop]){
                var name = Object.getPrototypeOf(source[prop]).constructor.name;
                console.log('=>', name);
                if (!destination[name]) destination[name] = {};
                destination[name][prop] = source[prop];
                crawler(source[prop], destination);
            }
        }
    }
}*/
var Parser = (function () {
    function Parser(metadata) {
        if (metadata)
            this.metadata = new odata_metadata_1.Edm.Edmx(metadata);
    }
    Parser.prototype.filter = function (source, options) { return parserFactory(Expressions.boolCommonExpr)(source, options, this.metadata); };
    Parser.prototype.keys = function (source, options) { return parserFactory(Expressions.keyPredicate)(source, options, this.metadata); };
    Parser.prototype.literal = function (source, options) { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options, this.metadata); };
    return Parser;
})();
exports.Parser = Parser;
