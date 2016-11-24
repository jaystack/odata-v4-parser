"use strict";
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
    return expand(value, index) ||
        filter(value, index) ||
        format(value, index) ||
        id(value, index) ||
        inlinecount(value, index) ||
        orderby(value, index) ||
        search(value, index) ||
        select(value, index) ||
        skip(value, index) ||
        skiptoken(value, index) ||
        top(value, index);
}
exports.systemQueryOption = systemQueryOption;
function id(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24id')) {
        index += 5;
    }
    else if (Utils.equals(value, index, '$id')) {
        index += 3;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    while (value[index] != 0x26 && index < value.length)
        index++;
    if (index == eq)
        return;
    return Lexer.tokenize(value, start, index, Utils.stringify(value, eq, index), Lexer.TokenType.Id);
}
exports.id = id;
function expand(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24expand')) {
        index += 9;
    }
    else if (Utils.equals(value, index, '$expand')) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var items = [];
    var token = expandItem(value, index);
    if (!token)
        return;
    index = token.next;
    while (token) {
        items.push(token);
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            var token = expandItem(value, index);
            if (!token)
                return;
            index = token.next;
        }
        else
            break;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Expand);
}
exports.expand = expand;
function expandItem(value, index) {
    var start = index;
    var star = Lexer.STAR(value, index);
    if (star) {
        index = star;
        var ref_1 = Expressions.refExpr(value, index);
        if (ref_1) {
            index = ref_1.next;
            return Lexer.tokenize(value, start, index, { path: '*', ref: ref_1 }, Lexer.TokenType.ExpandItem);
        }
        else {
            var open = Lexer.OPEN(value, index);
            if (open) {
                index = open;
                var token = levels(value, index);
                if (!token)
                    return;
                index = token.next;
                var close = Lexer.CLOSE(value, index);
                if (!close)
                    return;
                index = close;
                return Lexer.tokenize(value, start, index, { path: '*', levels: token }, Lexer.TokenType.ExpandItem);
            }
        }
    }
    var path = expandPath(value, index);
    if (!path)
        return;
    index = path.next;
    var tokenValue = { path: path };
    var ref = Expressions.refExpr(value, index);
    if (ref) {
        index = ref.next;
        tokenValue.ref = ref;
        var open_1 = Lexer.OPEN(value, index);
        if (open_1) {
            index = open_1;
            var option = expandRefOption(value, index);
            if (!option)
                return;
            var refOptions = [];
            while (option) {
                refOptions.push(option);
                index = option.next;
                var semi = Lexer.SEMI(value, index);
                if (semi) {
                    index = semi;
                    option = expandRefOption(value, index);
                    if (!option)
                        return;
                }
                else
                    break;
            }
            var close_1 = Lexer.CLOSE(value, index);
            if (!close_1)
                return;
            index = close_1;
            tokenValue.options = refOptions;
        }
    }
    else {
        var count = Expressions.countExpr(value, index);
        if (count) {
            index = count.next;
            tokenValue.count = count;
            var open_2 = Lexer.OPEN(value, index);
            if (open_2) {
                index = open_2;
                var option = expandCountOption(value, index);
                if (!option)
                    return;
                var countOptions = [];
                while (option) {
                    countOptions.push(option);
                    index = option.next;
                    var semi = Lexer.SEMI(value, index);
                    if (semi) {
                        index = semi;
                        option = expandCountOption(value, index);
                        if (!option)
                            return;
                    }
                    else
                        break;
                }
                var close_2 = Lexer.CLOSE(value, index);
                if (!close_2)
                    return;
                index = close_2;
                tokenValue.options = countOptions;
            }
        }
        else {
            var open = Lexer.OPEN(value, index);
            if (open) {
                index = open;
                var option = expandOption(value, index);
                if (!option)
                    return;
                var options = [];
                while (option) {
                    options.push(option);
                    index = option.next;
                    var semi = Lexer.SEMI(value, index);
                    if (semi) {
                        index = semi;
                        option = expandOption(value, index);
                        if (!option)
                            return;
                    }
                    else
                        break;
                }
                var close_3 = Lexer.CLOSE(value, index);
                if (!close_3)
                    return;
                index = close_3;
                tokenValue.options = options;
            }
        }
    }
    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.ExpandItem);
}
exports.expandItem = expandItem;
function expandCountOption(value, index) {
    return filter(value, index) ||
        search(value, index);
}
exports.expandCountOption = expandCountOption;
function expandRefOption(value, index) {
    return expandCountOption(value, index) ||
        orderby(value, index) ||
        skip(value, index) ||
        top(value, index) ||
        inlinecount(value, index);
}
exports.expandRefOption = expandRefOption;
function expandOption(value, index) {
    return expandRefOption(value, index) ||
        select(value, index) ||
        expand(value, index) ||
        levels(value, index);
}
exports.expandOption = expandOption;
function expandPath(value, index) {
    var start = index;
    var path = [];
    var token = NameOrIdentifier.qualifiedEntityTypeName(value, index) ||
        NameOrIdentifier.qualifiedComplexTypeName(value, index);
    if (token) {
        index = token.next;
        path.push(token);
        if (value[index] != 0x2f)
            return;
        index++;
    }
    var complex = NameOrIdentifier.complexProperty(value, index) ||
        NameOrIdentifier.complexColProperty(value, index);
    while (complex) {
        if (value[complex.next] == 0x2f) {
            index = complex.next + 1;
            path.push(complex);
            var complexTypeName = NameOrIdentifier.qualifiedComplexTypeName(value, index);
            if (complexTypeName) {
                if (value[complexTypeName.next] == 0x2f) {
                    index = complexTypeName.next + 1;
                    path.push(complexTypeName);
                }
            }
            complex = NameOrIdentifier.complexProperty(value, index) ||
                NameOrIdentifier.complexColProperty(value, index);
        }
        else
            break;
    }
    var nav = NameOrIdentifier.navigationProperty(value, index);
    if (!nav)
        return;
    index = nav.next;
    path.push(nav);
    if (value[index] == 0x2f) {
        var typeName = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1);
        if (typeName) {
            ;
            index = typeName.next;
            path.push(typeName);
        }
    }
    return Lexer.tokenize(value, start, index, path, Lexer.TokenType.ExpandPath);
}
exports.expandPath = expandPath;
function search(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24search')) {
        index += 9;
    }
    else if (Utils.equals(value, index, '$search')) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var expr = searchExpr(value, index);
    if (!expr)
        return;
    index = expr.next;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Search);
}
exports.search = search;
function searchExpr(value, index) {
    var token = searchParenExpr(value, index) ||
        searchTerm(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var expr = searchAndExpr(value, index) ||
        searchOrExpr(value, index);
    if (expr) {
        token.next = expr.value.next;
        token.value = {
            left: Lexer.clone(token),
            right: expr.value
        };
        token.type = expr.type;
        token.raw = Utils.stringify(value, token.position, token.next);
    }
    return token;
}
exports.searchExpr = searchExpr;
function searchTerm(value, index) {
    return searchNotExpr(value, index) ||
        searchPhrase(value, index) ||
        searchWord(value, index);
}
exports.searchTerm = searchTerm;
function searchNotExpr(value, index) {
    if (!Utils.equals(value, index, 'NOT'))
        return;
    var start = index;
    index += 3;
    var expr = searchPhrase(value, index) ||
        searchWord(value, index);
    if (!expr)
        return;
    index = expr.next;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.SearchNotExpression);
}
exports.searchNotExpr = searchNotExpr;
function searchOrExpr(value, index) {
    var rws = Lexer.RWS(value, index);
    if (rws == index || !Utils.equals(value, rws, 'OR'))
        return;
    var start = index;
    index = rws + 2;
    rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = searchExpr(value, index);
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.SearchOrExpression);
}
exports.searchOrExpr = searchOrExpr;
function searchAndExpr(value, index) {
    var rws = Lexer.RWS(value, index);
    if (rws == index || !Utils.equals(value, rws, 'AND'))
        return;
    var start = index;
    index = rws + 3;
    rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = searchExpr(value, index);
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.SearchAndExpression);
}
exports.searchAndExpr = searchAndExpr;
function searchPhrase(value, index) {
    var mark = Lexer.quotationMark(value, index);
    if (!mark)
        return;
    var start = index;
    index = mark;
    var valueStart = index;
    var ch = Lexer.qcharNoAMPDQUOTE(value, index);
    while (ch > index && !Lexer.OPEN(value, index) && !Lexer.CLOSE(value, index)) {
        index = ch;
        ch = Lexer.qcharNoAMPDQUOTE(value, index);
    }
    var valueEnd = index;
    mark = Lexer.quotationMark(value, index);
    if (!mark)
        return;
    index = mark;
    return Lexer.tokenize(value, start, index, Utils.stringify(value, valueStart, valueEnd), Lexer.TokenType.SearchPhrase);
}
exports.searchPhrase = searchPhrase;
function searchWord(value, index) {
    var next = Utils.required(value, index, Lexer.ALPHA, 1);
    if (!next)
        return;
    var start = index;
    index = next;
    var token = Lexer.tokenize(value, start, index, null, Lexer.TokenType.SearchWord);
    token.value = token.raw;
    return token;
}
exports.searchWord = searchWord;
function searchParenExpr(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    index = Lexer.BWS(value, index);
    var expr = searchExpr(value, index);
    if (!expr)
        return;
    index = expr.next;
    index = Lexer.BWS(value, index);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.SearchParenExpression);
}
exports.searchParenExpr = searchParenExpr;
function levels(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24levels')) {
        index += 9;
    }
    else if (Utils.equals(value, index, '$levels')) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var level;
    if (Utils.equals(value, index, 'max')) {
        level = 'max';
        index += 3;
    }
    else {
        var token = PrimitiveLiteral.int32Value(value, index);
        if (!token)
            return;
        level = token.raw;
        index = token.next;
    }
    return Lexer.tokenize(value, start, index, level, Lexer.TokenType.Levels);
}
exports.levels = levels;
function filter(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24filter')) {
        index += 9;
    }
    else if (Utils.equals(value, index, '$filter')) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var expr = Expressions.boolCommonExpr(value, index);
    if (!expr)
        return;
    index = expr.next;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Filter);
}
exports.filter = filter;
function orderby(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24orderby')) {
        index += 10;
    }
    else if (Utils.equals(value, index, '$orderby')) {
        index += 8;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var items = [];
    var token = orderbyItem(value, index);
    if (!token)
        return;
    index = token.next;
    while (token) {
        items.push(token);
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
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
    var start = index;
    if (Utils.equals(value, index, '%24skip')) {
        index += 7;
    }
    else if (Utils.equals(value, index, '$skip')) {
        index += 5;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var token = PrimitiveLiteral.int32Value(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Skip);
}
exports.skip = skip;
function top(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24top')) {
        index += 6;
    }
    else if (Utils.equals(value, index, '$top')) {
        index += 4;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var token = PrimitiveLiteral.int32Value(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Top);
}
exports.top = top;
function format(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24format')) {
        index += 9;
    }
    else if (Utils.equals(value, index, '$format')) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
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
    var start = index;
    if (Utils.equals(value, index, '%24count')) {
        index += 8;
    }
    else if (Utils.equals(value, index, '$count')) {
        index += 6;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var token = PrimitiveLiteral.booleanValue(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.InlineCount);
}
exports.inlinecount = inlinecount;
function select(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24select')) {
        index += 9;
    }
    else if (Utils.equals(value, index, '$select')) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var items = [];
    var token = selectItem(value, index);
    if (!token)
        return;
    while (token) {
        items.push(token);
        index = token.next;
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
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
    var star = Lexer.STAR(value, index);
    if (op > index) {
        item = { namespace: Utils.stringify(value, index, op - 2), value: '*' };
        index = op;
    }
    else if (star) {
        item = { value: '*' };
        index = star;
    }
    else {
        item = {};
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
    var star = Lexer.STAR(value, namespaceNext + 1);
    if (namespaceNext > index && value[namespaceNext] == 0x2e && star)
        return star;
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
        var name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1);
        if (name) {
            index = name.next;
            tokenValue = { prop: token, name: name };
        }
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
    var open = Lexer.OPEN(value, index);
    if (open) {
        index = open;
        tokenValue.parameters = [];
        var param = Expressions.parameterName(value, index);
        if (!param)
            return;
        while (param) {
            index = param.next;
            tokenValue.parameters.push(param);
            var comma = Lexer.COMMA(value, index);
            if (comma) {
                index = comma;
                var param = Expressions.parameterName(value, index);
                if (!param)
                    return;
            }
            else
                break;
        }
        var close = Lexer.CLOSE(value, index);
        if (!close)
            return;
        index = close;
    }
    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.Function);
}
exports.qualifiedFunctionName = qualifiedFunctionName;
function skiptoken(value, index) {
    var start = index;
    if (Utils.equals(value, index, '%24skiptoken')) {
        index += 12;
    }
    else if (Utils.equals(value, index, '$skiptoken')) {
        index += 10;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var ch = Lexer.qcharNoAMP(value, index);
    if (!ch)
        return;
    var valueStart = index;
    while (ch > index) {
        index = ch;
        ch = Lexer.qcharNoAMP(value, index);
    }
    return Lexer.tokenize(value, start, index, Utils.stringify(value, valueStart, index), Lexer.TokenType.SkipToken);
}
exports.skiptoken = skiptoken;
function aliasAndValue(value, index) {
    var alias = Expressions.parameterAlias(value, index);
    if (!alias)
        return;
    var start = index;
    index = alias.next;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEVBQUUsS0FBWTtJQUMvRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUEsQ0FBQztRQUM1QyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUFBLElBQUksQ0FDTCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQSxDQUFDO1FBQzFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDWixDQUFDO0lBQUEsSUFBSTtRQUFDLE1BQU0sQ0FBQztJQUViLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxJQUFJLE1BQU0sQ0FBQztJQUNYLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBLENBQUM7UUFDdkMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNoQixLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFDO1FBQzdDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDaEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFBQSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBQztRQUM1QyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2YsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLFFBQUEsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1RixDQUFDO0FBMUJlLGNBQU0sU0EwQnJCLENBQUE7QUFFRCxxQkFBNEIsS0FBMkIsRUFBRSxLQUFZO0lBQ3BFLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQSxDQUFDO1FBQzNDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDWixDQUFDO0lBQUEsSUFBSSxDQUNMLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFBLENBQUM7UUFDekMsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFBQSxJQUFJO1FBQUMsTUFBTSxDQUFDO0lBRWIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDaEIsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUVYLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFFbkIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQWxCZSxtQkFBVyxjQWtCMUIsQ0FBQTtBQUVELGdCQUF1QixLQUEyQixFQUFFLEtBQVk7SUFDL0QsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFBLENBQUM7UUFDNUMsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFBQSxJQUFJLENBQ0wsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUEsQ0FBQztRQUMxQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUFBLElBQUk7UUFBQyxNQUFNLENBQUM7SUFFYixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNoQixLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRVgsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2YsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuQixPQUFPLEtBQUssRUFBQyxDQUFDO1FBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUVuQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFDO1lBQ1YsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNkLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBQUEsSUFBSTtZQUFDLEtBQUssQ0FBQztJQUNiLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQUEsS0FBSyxFQUFFLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBN0JlLGNBQU0sU0E2QnJCLENBQUE7QUFFRCxvQkFBMkIsS0FBMkIsRUFBRSxLQUFZO0lBQ25FLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixJQUFJLElBQUksQ0FBQztJQUNULElBQUksRUFBRSxHQUFHLHFCQUFxQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3QyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUEsQ0FBQztRQUNmLElBQUksR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN4RSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFDO1FBQ2YsSUFBSSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQUEsSUFBSSxDQUFBLENBQUM7UUFDTCxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ1YsSUFBSSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztZQUNoRSxnQkFBZ0IsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFekQsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQzdDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO1lBQzFDLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVELElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1lBQ3hDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDakMscUJBQXFCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ3BCLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRXBCLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxNQUFBLElBQUksRUFBRSxRQUFBLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUN6QyxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pHLENBQUM7QUFoQ2Usa0JBQVUsYUFnQ3pCLENBQUE7QUFFRCwrQkFBc0MsS0FBMkIsRUFBRSxLQUFZO0lBQzlFLElBQUksYUFBYSxHQUFHLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0QsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hELEVBQUUsQ0FBQyxDQUFDLGFBQWEsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQy9FLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDZCxDQUFDO0FBTGUsNkJBQXFCLHdCQUtwQyxDQUFBO0FBRUQsd0JBQStCLEtBQTJCLEVBQUUsS0FBWTtJQUN2RSxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNuQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2hELGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkQsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25ELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ25CLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUVuQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQztRQUM3QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUEsQ0FBQztZQUN6QixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBQ2xCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUIsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RCxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsTUFBQSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO1FBQ3BDLENBQUM7SUFDRixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNkLENBQUM7QUF2QmUsc0JBQWMsaUJBdUI3QixDQUFBO0FBRUQsb0JBQTJCLEtBQTJCLEVBQUUsS0FBWTtJQUNuRSxJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUN6RCxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBRW5CLElBQUksVUFBVSxHQUFPLEtBQUssQ0FBQztJQUMzQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUEsQ0FBQztRQUN6QixJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7WUFDVCxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNsQixVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQUEsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBbEJlLGtCQUFVLGFBa0J6QixDQUFBO0FBRUQsNkJBQW9DLEtBQTJCLEVBQUUsS0FBWTtJQUM1RSxJQUFJLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdELEVBQUUsQ0FBQyxDQUFDLGFBQWEsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuRSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFFMUIsSUFBSSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUVwQixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEYsQ0FBQztBQVZlLDJCQUFtQixzQkFVbEMsQ0FBQTtBQUVELCtCQUFzQyxLQUEyQixFQUFFLEtBQVk7SUFDOUUsSUFBSSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RCxFQUFFLENBQUMsQ0FBQyxhQUFhLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkUsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBRTFCLElBQUksRUFBRSxHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDaEIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7SUFDaEIsSUFBSSxVQUFVLEdBQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFFbEMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQztRQUNULEtBQUssR0FBRyxJQUFJLENBQUM7UUFDYixVQUFVLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUVuQixPQUFPLEtBQUssRUFBQyxDQUFDO1lBQ2IsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDbkIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFbEMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsQ0FBQztnQkFDVixLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUNkLElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFBQyxNQUFNLENBQUM7WUFDcEIsQ0FBQztZQUFBLElBQUk7Z0JBQUMsS0FBSyxDQUFDO1FBQ2IsQ0FBQztRQUVELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ25CLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEYsQ0FBQztBQXBDZSw2QkFBcUIsd0JBb0NwQyxDQUFBO0FBRUQsbUJBQTBCLEtBQTJCLEVBQUUsS0FBWTtJQUNsRSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUEsQ0FBQztRQUMvQyxLQUFLLElBQUksRUFBRSxDQUFDO0lBQ2IsQ0FBQztJQUFBLElBQUksQ0FDTCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQSxDQUFDO1FBQzdDLEtBQUssSUFBSSxFQUFFLENBQUM7SUFDYixDQUFDO0lBQUEsSUFBSTtRQUFDLE1BQU0sQ0FBQztJQUViLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNoQixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFFdkIsT0FBTyxFQUFFLEdBQUcsS0FBSyxFQUFDLENBQUM7UUFDbEIsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNYLEVBQUUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEgsQ0FBQztBQXZCZSxpQkFBUyxZQXVCeEIsQ0FBQTtBQUVELHVCQUE4QixLQUEyQixFQUFFLEtBQVk7SUFDdEUsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBRW5CLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUN4QixLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztJQUV4QixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtRQUMxQyxPQUFBLEtBQUs7UUFDTCxLQUFLLEVBQUUsVUFBVTtLQUNqQixFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQWxCZSxxQkFBYSxnQkFrQjVCLENBQUE7QUFFRCx5QkFBeUIiLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VSb290IjoiLi4vc3JjIn0=
