"use strict";
var Lexer = require('./lexer');
var Query = require('./query');
var ResourcePath = require('./resourcePath');
function odataUri(value, index, metadataContext) {
    var resource = ResourcePath.resourcePath(value, index, metadataContext);
    while (!resource && index < value.length) {
        while (value[++index] != 0x2f && index < value.length)
            ;
        resource = ResourcePath.resourcePath(value, index, metadataContext);
    }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9kYXRhVXJpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUdqQyxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUNqQyxJQUFZLFlBQVksV0FBTSxnQkFBZ0IsQ0FBQyxDQUFBO0FBRS9DLGtCQUF5QixLQUEyQixFQUFFLEtBQVksRUFBRSxlQUFvQjtJQUN2RixJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDeEUsT0FBTyxDQUFDLFFBQVEsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBQyxDQUFDO1FBQ3pDLE9BQU8sS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTTtZQUFDLENBQUM7UUFDdkQsUUFBUSxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDdEIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBRXRCLElBQUksS0FBSyxDQUFDO0lBQ1YsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUM7UUFDekIsS0FBSyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNuQixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFBLFFBQVEsRUFBRSxPQUFBLEtBQUssRUFBRSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0YsQ0FBQztBQWxCZSxnQkFBUSxXQWtCdkIsQ0FBQSIsImZpbGUiOiJvZGF0YVVyaS5qcyIsInNvdXJjZVJvb3QiOiIuLi9zcmMifQ==
