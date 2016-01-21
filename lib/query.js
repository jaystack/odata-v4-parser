var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
var NameOrIdentifier = require('./nameOrIdentifier');
var Expressions = require('./expressions');
function queryOptions(value, index) {
    var token = queryOption(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var options = [];
    while (token) {
        options.push(token);
        // &
        if (value[index] != 0x26)
            break;
        index++;
        token = queryOption(value, index);
        if (!token)
            return;
        index = token.next;
    }
    return Lexer.tokenize(value, start, index, { options: options }, Lexer.TokenType.QueryOptions);
}
exports.queryOptions = queryOptions;
function queryOption(value, index) {
    return systemQueryOption(value, index) ||
        aliasAndValue(value, index); // ||
    // customQueryOption(value, index);
}
exports.queryOption = queryOption;
function systemQueryOption(value, index) {
    // return expand(value, index) ||
    return filter(value, index) ||
        format(value, index) ||
        id(value, index) ||
        inlinecount(value, index) ||
        orderby(value, index) ||
        // search(value, index) ||
        select(value, index) ||
        skip(value, index) ||
        // skiptoken(value, index) ||
        top(value, index);
}
exports.systemQueryOption = systemQueryOption;
function id(value, index) {
    if (!Utils.equals(value, index, '$id'))
        return;
    var start = index;
    index += 3;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    //TODO: navigation
}
exports.id = id;
function filter(value, index) {
    if (!Utils.equals(value, index, '$filter'))
        return;
    var start = index;
    index += 7;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    var expr = Expressions.boolCommonExpr(value, index);
    if (!expr)
        return;
    index = expr.next;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Filter);
}
exports.filter = filter;
function orderby(value, index) {
    if (!Utils.equals(value, index, '$orderby'))
        return;
    var start = index;
    index += 8;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    var items = [];
    var token = orderbyItem(value, index);
    if (!token)
        return;
    index = token.next;
    while (token) {
        items.push(token);
        if (Lexer.COMMA(value[index])) {
            index++;
            var token = orderbyItem(value, index);
            if (!token)
                return;
            index = token.next;
        }
        else
            break;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.OrderBy);
}
exports.orderby = orderby;
function orderbyItem(value, index) {
    var expr = Expressions.commonExpr(value, index);
    if (!expr)
        return;
    var start = index;
    index = expr.next;
    var direction = 1;
    var rws = Lexer.RWS(value, index);
    if (rws > index) {
        index = rws;
        if (Utils.equals(value, index, 'asc'))
            index += 3;
        else if (Utils.equals(value, index, 'desc')) {
            index += 4;
            direction = -1;
        }
        else
            return;
    }
    return Lexer.tokenize(value, start, index, { expr: expr, direction: direction }, Lexer.TokenType.OrderByItem);
}
exports.orderbyItem = orderbyItem;
function skip(value, index) {
    if (!Utils.equals(value, index, '$skip'))
        return;
    var start = index;
    index += 5;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    var token = PrimitiveLiteral.int32Value(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Skip);
}
exports.skip = skip;
function top(value, index) {
    if (!Utils.equals(value, index, '$top'))
        return;
    var start = index;
    index += 4;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    var token = PrimitiveLiteral.int32Value(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Top);
}
exports.top = top;
function format(value, index) {
    if (!Utils.equals(value, index, '$format'))
        return;
    var start = index;
    index += 7;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    var format;
    if (Utils.equals(value, index, 'atom')) {
        format = 'atom';
        index += 4;
    }
    else if (Utils.equals(value, index, 'json')) {
        format = 'json';
        index += 4;
    }
    else if (Utils.equals(value, index, 'xml')) {
        format = 'xml';
        index += 3;
    }
    if (format)
        return Lexer.tokenize(value, start, index, { format: format }, Lexer.TokenType.Format);
}
exports.format = format;
function inlinecount(value, index) {
    if (!Utils.equals(value, index, '$count'))
        return;
    var start = index;
    index += 6;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    var token = PrimitiveLiteral.booleanValue(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.InlineCount);
}
exports.inlinecount = inlinecount;
//TODO: search
function select(value, index) {
    if (!Utils.equals(value, index, '$select'))
        return;
    var start = index;
    index += 7;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    var items = [];
    var token = selectItem(value, index);
    if (!token)
        return;
    while (token) {
        items.push(token);
        index = token.next;
        if (Lexer.COMMA(value[index])) {
            index++;
            token = selectItem(value, index);
            if (!token)
                return;
        }
        else
            break;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Select);
}
exports.select = select;
function selectItem(value, index) {
    var start = index;
    var item;
    var op = allOperationsInSchema(value, index);
    if (op > index) {
        item = { namespace: Utils.stringify(value, index, op - 2), value: '*' };
        index = op;
    }
    else if (Lexer.STAR(value[index])) {
        item = { value: '*' };
        index++;
    }
    else {
        var name = NameOrIdentifier.qualifiedEntityTypeName(value, index) ||
            NameOrIdentifier.qualifiedComplexTypeName(value, index);
        if (name && value[name.next] != 0x2f)
            return;
        else if (name && value[name.next] == 0x2f) {
            index++;
            item.name = name;
        }
        var select = selectProperty(value, index) ||
            qualifiedActionName(value, index) ||
            qualifiedFunctionName(value, index);
        if (!select)
            return;
        index = select.next;
        item = name ? { name: name, select: select } : select;
    }
    if (index > start)
        return Lexer.tokenize(value, start, index, item, Lexer.TokenType.SelectItem);
}
exports.selectItem = selectItem;
function allOperationsInSchema(value, index) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext > index && value[namespaceNext] == 0x2e && Lexer.STAR(value[namespaceNext + 1]))
        return namespaceNext + 2;
    return index;
}
exports.allOperationsInSchema = allOperationsInSchema;
function selectProperty(value, index) {
    var token = selectPath(value, index) ||
        NameOrIdentifier.primitiveProperty(value, index) ||
        NameOrIdentifier.primitiveColProperty(value, index) ||
        NameOrIdentifier.navigationProperty(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    if (token.type == Lexer.TokenType.SelectPath) {
        if (value[index] == 0x2f) {
            index++;
            var prop = selectProperty(value, index);
            if (!prop)
                return;
            var path = Lexer.clone(token);
            token.next = prop.next;
            token.raw = Utils.stringify(value, start, token.next);
            token.value = { path: path, next: prop };
        }
    }
    return token;
}
exports.selectProperty = selectProperty;
function selectPath(value, index) {
    var token = NameOrIdentifier.complexProperty(value, index) ||
        NameOrIdentifier.complexColProperty(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var tokenValue = token;
    if (value[index] == 0x2f) {
        index++;
        var name = NameOrIdentifier.qualifiedComplexTypeName(value, index);
        if (!name)
            return;
        index = name.next;
        tokenValue = { prop: token, name: name };
    }
    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.SelectPath);
}
exports.selectPath = selectPath;
function qualifiedActionName(value, index) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var start = index;
    index = namespaceNext + 1;
    var action = NameOrIdentifier.action(value, index);
    if (!action)
        return;
    return Lexer.tokenize(value, start, action.next, action, Lexer.TokenType.Action);
}
exports.qualifiedActionName = qualifiedActionName;
function qualifiedFunctionName(value, index) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var start = index;
    index = namespaceNext + 1;
    var fn = NameOrIdentifier.odataFunction(value, index);
    if (!fn)
        return;
    index = fn.next;
    var tokenValue = { name: fn };
    if (Lexer.OPEN(value[index])) {
        index++;
        tokenValue.parameters = [];
        var param = Expressions.parameterName(value, index);
        if (!param)
            return;
        while (param) {
            index = param.next;
            tokenValue.parameters.push(param);
            if (Lexer.COMMA(value[index])) {
                index++;
                var param = Expressions.parameterName(value, index);
                if (!param)
                    return;
            }
            else
                break;
        }
        if (!Lexer.CLOSE(value[index]))
            return;
        index++;
    }
    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.Function);
}
exports.qualifiedFunctionName = qualifiedFunctionName;
//TODO: skiptoken
function aliasAndValue(value, index) {
    var alias = Expressions.parameterAlias(value, index);
    if (!alias)
        return;
    var start = index;
    index = alias.next;
    if (!Lexer.EQ(value[index]))
        return;
    index++;
    var paramValue = Expressions.parameterValue(value, index);
    if (!paramValue)
        return;
    index = paramValue.next;
    return Lexer.tokenize(value, start, index, {
        alias: alias,
        value: paramValue
    }, Lexer.TokenType.AliasAndValue);
}
exports.aliasAndValue = aliasAndValue;
//TODO: customQueryOption
