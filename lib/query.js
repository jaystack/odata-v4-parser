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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUNqQyxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUNqQyxJQUFZLGdCQUFnQixXQUFNLG9CQUFvQixDQUFDLENBQUE7QUFDdkQsSUFBWSxnQkFBZ0IsV0FBTSxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3ZELElBQVksV0FBVyxXQUFNLGVBQWUsQ0FBQyxDQUFBO0FBRTdDLHNCQUE2QixLQUEyQixFQUFFLEtBQVk7SUFDckUsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFFbkIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLE9BQU8sS0FBSyxFQUFDLENBQUM7UUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLElBQUk7UUFDSixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO1lBQUMsS0FBSyxDQUFDO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBRVIsS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDbkIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBQSxPQUFPLEVBQUUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3ZGLENBQUM7QUFuQmUsb0JBQVksZUFtQjNCLENBQUE7QUFFRCxxQkFBNEIsS0FBMkIsRUFBRSxLQUFZO0lBQ3BFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3JDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQSxLQUFLO0lBQ2pDLG1DQUFtQztBQUNyQyxDQUFDO0FBSmUsbUJBQVcsY0FJMUIsQ0FBQTtBQUVELDJCQUFrQyxLQUEyQixFQUFFLEtBQVk7SUFDMUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2hCLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2xCLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEIsQ0FBQztBQVplLHlCQUFpQixvQkFZaEMsQ0FBQTtBQUVELFlBQW1CLEtBQTJCLEVBQUUsS0FBWTtJQUMzRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUMvQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUVYLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxrQkFBa0I7QUFDbkIsQ0FBQztBQVZlLFVBQUUsS0FVakIsQ0FBQTtBQUVELGdCQUF1QixLQUEyQixFQUFFLEtBQVk7SUFDL0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssSUFBSSxDQUFDLENBQUM7SUFFWCxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNoQixLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRVgsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2YsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuQixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUVuQixPQUFPLEtBQUssRUFBQyxDQUFDO1FBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVsQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFDO1lBQ1YsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNkLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBQ25CLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUM7UUFBQSxJQUFJO1lBQUMsS0FBSyxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBQSxLQUFLLEVBQUUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9FLENBQUM7QUEzQmUsY0FBTSxTQTJCckIsQ0FBQTtBQUVELG9CQUEyQixLQUEyQixFQUFFLEtBQVk7SUFDbkUsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7UUFDVCxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2IsSUFBSSxLQUFHLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUMsRUFBRSxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUEsQ0FBQztZQUNSLEtBQUssR0FBRyxLQUFHLENBQUMsSUFBSSxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFBLEtBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUYsQ0FBQztRQUFBLElBQUksQ0FBQSxDQUFDO1lBQ0wsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQztnQkFDVCxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUFDLE1BQU0sQ0FBQztnQkFDbkIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBRW5CLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFBQyxNQUFNLENBQUM7Z0JBQ25CLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBRWQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RHLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFFbEIsSUFBSSxVQUFVLEdBQU8sRUFBRSxNQUFBLElBQUksRUFBRSxDQUFDO0lBRTlCLElBQUksR0FBRyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7UUFDUixLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUVyQixJQUFJLE1BQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwQyxFQUFFLENBQUMsQ0FBQyxNQUFJLENBQUMsQ0FBQSxDQUFDO1lBQ1QsS0FBSyxHQUFHLE1BQUksQ0FBQztZQUViLElBQUksTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDM0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBRXBCLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixPQUFPLE1BQU0sRUFBQyxDQUFDO2dCQUNkLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3hCLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUVwQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQztvQkFDVCxLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUViLE1BQU0sR0FBRyxlQUFlLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUN2QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQzt3QkFBQyxNQUFNLENBQUM7Z0JBQ3JCLENBQUM7Z0JBQUEsSUFBSTtvQkFBQyxLQUFLLENBQUM7WUFDYixDQUFDO1lBRUQsSUFBSSxPQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFLLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBQ25CLEtBQUssR0FBRyxPQUFLLENBQUM7WUFFZCxVQUFVLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQztRQUNqQyxDQUFDO0lBQ0YsQ0FBQztJQUFBLElBQUksQ0FBQSxDQUFDO1FBQ0wsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsQ0FBQztZQUNWLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ25CLFVBQVUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRXpCLElBQUksTUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLE1BQUksQ0FBQyxDQUFBLENBQUM7Z0JBQ1QsS0FBSyxHQUFHLE1BQUksQ0FBQztnQkFFYixJQUFJLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO29CQUFDLE1BQU0sQ0FBQztnQkFFcEIsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO2dCQUN0QixPQUFPLE1BQU0sRUFBQyxDQUFDO29CQUNkLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzFCLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO29CQUVwQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQzt3QkFDVCxLQUFLLEdBQUcsSUFBSSxDQUFDO3dCQUViLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ3pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDOzRCQUFDLE1BQU0sQ0FBQztvQkFDckIsQ0FBQztvQkFBQSxJQUFJO3dCQUFDLEtBQUssQ0FBQztnQkFDYixDQUFDO2dCQUVELElBQUksT0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQUssQ0FBQztvQkFBQyxNQUFNLENBQUM7Z0JBQ25CLEtBQUssR0FBRyxPQUFLLENBQUM7Z0JBQ2QsVUFBVSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7WUFDbkMsQ0FBQztRQUNGLENBQUM7UUFBQSxJQUFJLENBQUEsQ0FBQztZQUNMLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7Z0JBQ1QsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFFYixJQUFJLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztvQkFBQyxNQUFNLENBQUM7Z0JBRXBCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDakIsT0FBTyxNQUFNLEVBQUMsQ0FBQztvQkFDZCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNyQixLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFFcEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7d0JBQ1QsS0FBSyxHQUFHLElBQUksQ0FBQzt3QkFFYixNQUFNLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDcEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7NEJBQUMsTUFBTSxDQUFDO29CQUNyQixDQUFDO29CQUFBLElBQUk7d0JBQUMsS0FBSyxDQUFDO2dCQUNiLENBQUM7Z0JBRUQsSUFBSSxPQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBSyxDQUFDO29CQUFDLE1BQU0sQ0FBQztnQkFDbkIsS0FBSyxHQUFHLE9BQUssQ0FBQztnQkFDZCxVQUFVLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUM5QixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBL0hlLGtCQUFVLGFBK0h6QixDQUFBO0FBRUQsMkJBQWtDLEtBQTJCLEVBQUUsS0FBWTtJQUMxRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDMUIsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBSGUseUJBQWlCLG9CQUdoQyxDQUFBO0FBRUQseUJBQWdDLEtBQTJCLEVBQUUsS0FBWTtJQUN4RSxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNyQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNsQixHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNqQixXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFOZSx1QkFBZSxrQkFNOUIsQ0FBQTtBQUVELHNCQUE2QixLQUEyQixFQUFFLEtBQVk7SUFDckUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUxlLG9CQUFZLGVBSzNCLENBQUE7QUFFRCxvQkFBMkIsS0FBMkIsRUFBRSxLQUFZO0lBQ25FLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFFZCxJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2pFLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV6RCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFDO1FBQ1YsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ2pDLEtBQUssRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELElBQUksT0FBTyxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQzNELGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRCxPQUFPLE9BQU8sRUFBQyxDQUFDO1FBQ2YsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO1lBQ2hDLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5CLElBQUksZUFBZSxHQUFHLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5RSxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQSxDQUFDO2dCQUNwQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUM7b0JBQ3hDLEtBQUssR0FBRyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztvQkFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7Z0JBQ3ZELGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQUEsSUFBSTtZQUFDLEtBQUssQ0FBQztJQUNiLENBQUM7SUFFRCxJQUFJLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFNUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDakIsS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVmLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO1FBQ3pCLElBQUksUUFBUSxHQUFHLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUEsQ0FBQztZQUFBLENBQUM7WUFDZCxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7SUFDRixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUUsQ0FBQztBQWpEZSxrQkFBVSxhQWlEekIsQ0FBQTtBQUVELGdCQUF1QixLQUEyQixFQUFFLEtBQVk7SUFDL0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssSUFBSSxDQUFDLENBQUM7SUFFWCxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNoQixLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRVgsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNsQixLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUVsQixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBZGUsY0FBTSxTQWNyQixDQUFBO0FBRUQsb0JBQTJCLEtBQTJCLEVBQUUsS0FBWTtJQUNuRSxJQUFJLEtBQUssR0FBRyxlQUFlLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUN4QyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ25CLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUVuQixJQUFJLElBQUksR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNyQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTVCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7UUFDVCxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQzdCLEtBQUssQ0FBQyxLQUFLLEdBQUc7WUFDYixJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDeEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2pCLENBQUM7UUFDRixLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNkLENBQUM7QUF0QmUsa0JBQVUsYUFzQnpCLENBQUE7QUFFRCxvQkFBMkIsS0FBMkIsRUFBRSxLQUFZO0lBQ25FLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNqQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUMxQixVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFKZSxrQkFBVSxhQUl6QixDQUFBO0FBRUQsdUJBQThCLEtBQTJCLEVBQUUsS0FBWTtJQUN0RSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUMvQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUVYLElBQUksSUFBSSxHQUFHLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3BDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFFbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN2RixDQUFDO0FBWGUscUJBQWEsZ0JBVzVCLENBQUE7QUFFRCxzQkFBNkIsS0FBMkIsRUFBRSxLQUFZO0lBQ3JFLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDNUQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5QixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ3pCLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDWixJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBRW5CLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDdkYsQ0FBQztBQVplLG9CQUFZLGVBWTNCLENBQUE7QUFFRCx1QkFBOEIsS0FBMkIsRUFBRSxLQUFZO0lBQ3RFLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDN0QsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5QixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ3pCLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDWixJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBRW5CLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDeEYsQ0FBQztBQVplLHFCQUFhLGdCQVk1QixDQUFBO0FBRUQsc0JBQTZCLEtBQTJCLEVBQUUsS0FBWTtJQUNyRSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNsQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQztJQUViLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztJQUN2QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlDLE9BQU8sRUFBRSxHQUFHLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUMsQ0FBQztRQUM3RSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ1gsRUFBRSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztJQUVyQixJQUFJLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQztJQUViLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3hILENBQUM7QUFuQmUsb0JBQVksZUFtQjNCLENBQUE7QUFFRCxvQkFBMkIsS0FBMkIsRUFBRSxLQUFZO0lBQ25FLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2xCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixLQUFLLEdBQUcsSUFBSSxDQUFDO0lBRWIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsRixLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDeEIsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNkLENBQUM7QUFUZSxrQkFBVSxhQVN6QixDQUFBO0FBRUQseUJBQWdDLEtBQTJCLEVBQUUsS0FBWTtJQUN4RSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNsQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNiLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVoQyxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2xCLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBRWxCLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuQixLQUFLLEdBQUcsS0FBSyxDQUFDO0lBRWQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6RixDQUFDO0FBakJlLHVCQUFlLGtCQWlCOUIsQ0FBQTtBQUVELGdCQUF1QixLQUEyQixFQUFFLEtBQVk7SUFDL0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssSUFBSSxDQUFDLENBQUM7SUFFWCxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNoQixLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRVgsSUFBSSxLQUFLLENBQUM7SUFDVixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQSxDQUFDO1FBQ3RDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDZCxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUFBLElBQUksQ0FBQSxDQUFDO1FBQ0wsSUFBSSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNuQixLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUNsQixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQXJCZSxjQUFNLFNBcUJyQixDQUFBO0FBRUQsZ0JBQXVCLEtBQTJCLEVBQUUsS0FBWTtJQUMvRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUVYLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNsQixLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUVsQixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBZGUsY0FBTSxTQWNyQixDQUFBO0FBRUQsaUJBQXdCLEtBQTJCLEVBQUUsS0FBWTtJQUNoRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNwRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUVYLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ25CLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBRW5CLE9BQU8sS0FBSyxFQUFDLENBQUM7UUFDYixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWxCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBLENBQUM7WUFDVixLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2QsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFDbkIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDcEIsQ0FBQztRQUFBLElBQUk7WUFBQyxLQUFLLENBQUM7SUFDYixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFBLEtBQUssRUFBRSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQTNCZSxlQUFPLFVBMkJ0QixDQUFBO0FBRUQscUJBQTRCLEtBQTJCLEVBQUUsS0FBWTtJQUNwRSxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNsQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFFbEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQSxDQUFDO1FBQ2hCLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDWixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFDO1lBQzVDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDWCxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEIsQ0FBQztRQUFBLElBQUk7WUFBQyxNQUFNLENBQUM7SUFDZCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxNQUFBLElBQUksRUFBRSxXQUFBLFNBQVMsRUFBRSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUYsQ0FBQztBQWxCZSxtQkFBVyxjQWtCMUIsQ0FBQTtBQUVELGNBQXFCLEtBQTJCLEVBQUUsS0FBWTtJQUM3RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNqRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUVYLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ25CLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBRW5CLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pFLENBQUM7QUFkZSxZQUFJLE9BY25CLENBQUE7QUFFRCxhQUFvQixLQUEyQixFQUFFLEtBQVk7SUFDNUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDaEQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssSUFBSSxDQUFDLENBQUM7SUFFWCxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNoQixLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRVgsSUFBSSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuQixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUVuQixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4RSxDQUFDO0FBZGUsV0FBRyxNQWNsQixDQUFBO0FBRUQsZ0JBQXVCLEtBQTJCLEVBQUUsS0FBWTtJQUMvRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUVYLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxJQUFJLE1BQU0sQ0FBQztJQUNYLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBLENBQUM7UUFDdkMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNoQixLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFDO1FBQzdDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDaEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFBQSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBQztRQUM1QyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2YsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLFFBQUEsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1RixDQUFDO0FBdEJlLGNBQU0sU0FzQnJCLENBQUE7QUFFRCxxQkFBNEIsS0FBMkIsRUFBRSxLQUFZO0lBQ3BFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2xELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixLQUFLLElBQUksQ0FBQyxDQUFDO0lBRVgsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDaEIsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUVYLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFFbkIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQWRlLG1CQUFXLGNBYzFCLENBQUE7QUFFRCxjQUFjO0FBRWQsZ0JBQXVCLEtBQTJCLEVBQUUsS0FBWTtJQUMvRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUVYLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFWCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ25CLE9BQU8sS0FBSyxFQUFDLENBQUM7UUFDYixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBRW5CLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBLENBQUM7WUFDVixLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2QsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFBQSxJQUFJO1lBQUMsS0FBSyxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBQSxLQUFLLEVBQUUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9FLENBQUM7QUF6QmUsY0FBTSxTQXlCckIsQ0FBQTtBQUVELG9CQUEyQixLQUEyQixFQUFFLEtBQVk7SUFDbkUsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLElBQUksSUFBSSxDQUFDO0lBQ1QsSUFBSSxFQUFFLEdBQUcscUJBQXFCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQSxDQUFDO1FBQ2YsSUFBSSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3hFLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDWixDQUFDO0lBQUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7UUFDZixJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDdEIsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNkLENBQUM7SUFBQSxJQUFJLENBQUEsQ0FBQztRQUNMLElBQUksR0FBRyxFQUFFLENBQUM7UUFDVixJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1lBQ2hFLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV6RCxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDN0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUM7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixDQUFDO1FBRUQsSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDeEMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztZQUNqQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDcEIsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFcEIsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLE1BQUEsSUFBSSxFQUFFLFFBQUEsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakcsQ0FBQztBQWhDZSxrQkFBVSxhQWdDekIsQ0FBQTtBQUVELCtCQUFzQyxLQUEyQixFQUFFLEtBQVk7SUFDOUUsSUFBSSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEQsRUFBRSxDQUFDLENBQUMsYUFBYSxHQUFHLEtBQUssSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDL0UsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNkLENBQUM7QUFMZSw2QkFBcUIsd0JBS3BDLENBQUE7QUFFRCx3QkFBK0IsS0FBMkIsRUFBRSxLQUFZO0lBQ3ZFLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ25DLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDaEQsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNuRCxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDbkIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBRW5CLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO1lBQ3pCLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFDbEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDdkIsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RELEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxNQUFBLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2QsQ0FBQztBQXZCZSxzQkFBYyxpQkF1QjdCLENBQUE7QUFFRCxvQkFBMkIsS0FBMkIsRUFBRSxLQUFZO0lBQ25FLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3pELGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFFbkIsSUFBSSxVQUFVLEdBQU8sS0FBSyxDQUFDO0lBQzNCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO1FBQ3pCLElBQUksSUFBSSxHQUFHLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQztZQUNULEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2xCLFVBQVUsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBQSxJQUFJLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0lBQ0YsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFsQmUsa0JBQVUsYUFrQnpCLENBQUE7QUFFRCw2QkFBb0MsS0FBMkIsRUFBRSxLQUFZO0lBQzVFLElBQUksYUFBYSxHQUFHLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0QsRUFBRSxDQUFDLENBQUMsYUFBYSxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ25FLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixLQUFLLEdBQUcsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUUxQixJQUFJLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25ELEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBRXBCLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBVmUsMkJBQW1CLHNCQVVsQyxDQUFBO0FBRUQsK0JBQXNDLEtBQTJCLEVBQUUsS0FBWTtJQUM5RSxJQUFJLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdELEVBQUUsQ0FBQyxDQUFDLGFBQWEsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuRSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFFMUIsSUFBSSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNoQixLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUNoQixJQUFJLFVBQVUsR0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUVsQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFDO1FBQ1QsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNiLFVBQVUsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQzNCLElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBRW5CLE9BQU8sS0FBSyxFQUFDLENBQUM7WUFDYixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztZQUNuQixVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFDO2dCQUNWLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQ2QsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3BELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUFDLE1BQU0sQ0FBQztZQUNwQixDQUFDO1lBQUEsSUFBSTtnQkFBQyxLQUFLLENBQUM7UUFDYixDQUFDO1FBRUQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDbkIsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBcENlLDZCQUFxQix3QkFvQ3BDLENBQUE7QUFFRCxtQkFBMEIsS0FBMkIsRUFBRSxLQUFZO0lBQ2xFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ3RELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixLQUFLLElBQUksRUFBRSxDQUFDO0lBRVosSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDaEIsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUVYLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2hCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztJQUV2QixPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQUMsQ0FBQztRQUNsQixLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ1gsRUFBRSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsSCxDQUFDO0FBbkJlLGlCQUFTLFlBbUJ4QixDQUFBO0FBRUQsdUJBQThCLEtBQTJCLEVBQUUsS0FBWTtJQUN0RSxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUNuQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFFbkIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDaEIsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUVYLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFELEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ3hCLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO0lBRXhCLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO1FBQzFDLE9BQUEsS0FBSztRQUNMLEtBQUssRUFBRSxVQUFVO0tBQ2pCLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBbEJlLHFCQUFhLGdCQWtCNUIsQ0FBQTtBQUVELHlCQUF5QiIsImZpbGUiOiJxdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIuLi9zcmMifQ==
