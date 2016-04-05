"use strict";
var Lexer = require('./lexer');
var Query = require('./query');
var ResourcePath = require('./resourcePath');
function odataUri(value, index) {
    var resource = ResourcePath.resourcePath(value, index);
    if (!resource)
        return;
    var start = index;
    index = resource.next;
    var query;
    if (value[index] == 0x3f) {
        query = Query.queryOptions(value, index + 1);
        if (!query)
            return;
        index = query.next;
    }
    return Lexer.tokenize(value, start, index, { resource: resource, query: query }, Lexer.TokenType.ODataUri);
}
exports.odataUri = odataUri;
//# sourceMappingURL=odataUri.js.map