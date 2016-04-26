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
    if (!Utils.equals(value, index, '$id'))
        return;
    var start = index;
    index += 3;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    //TODO: navigation
}
exports.id = id;
function expand(value, index) {
    if (!Utils.equals(value, index, '$expand'))
        return;
    var start = index;
    index += 7;
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
    if (!Utils.equals(value, index, '$search'))
        return;
    var start = index;
    index += 7;
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
    if (!Utils.equals(value, index, '$levels'))
        return;
    var start = index;
    index += 7;
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
    if (!Utils.equals(value, index, '$filter'))
        return;
    var start = index;
    index += 7;
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
    if (!Utils.equals(value, index, '$orderby'))
        return;
    var start = index;
    index += 8;
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
    if (!Utils.equals(value, index, '$skip'))
        return;
    var start = index;
    index += 5;
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
    if (!Utils.equals(value, index, '$top'))
        return;
    var start = index;
    index += 4;
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
    if (!Utils.equals(value, index, '$format'))
        return;
    var start = index;
    index += 7;
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
    if (!Utils.equals(value, index, '$count'))
        return;
    var start = index;
    index += 6;
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
//TODO: search
function select(value, index) {
    if (!Utils.equals(value, index, '$select'))
        return;
    var start = index;
    index += 7;
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
    if (!Utils.equals(value, index, '$skiptoken'))
        return;
    var start = index;
    index += 10;
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
//# sourceMappingURL=query.js.map