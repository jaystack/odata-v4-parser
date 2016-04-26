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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXJ5LnRzIl0sIm5hbWVzIjpbInF1ZXJ5T3B0aW9ucyIsInF1ZXJ5T3B0aW9uIiwic3lzdGVtUXVlcnlPcHRpb24iLCJpZCIsImV4cGFuZCIsImV4cGFuZEl0ZW0iLCJleHBhbmRDb3VudE9wdGlvbiIsImV4cGFuZFJlZk9wdGlvbiIsImV4cGFuZE9wdGlvbiIsImV4cGFuZFBhdGgiLCJzZWFyY2giLCJzZWFyY2hFeHByIiwic2VhcmNoVGVybSIsInNlYXJjaE5vdEV4cHIiLCJzZWFyY2hPckV4cHIiLCJzZWFyY2hBbmRFeHByIiwic2VhcmNoUGhyYXNlIiwic2VhcmNoV29yZCIsInNlYXJjaFBhcmVuRXhwciIsImxldmVscyIsImZpbHRlciIsIm9yZGVyYnkiLCJvcmRlcmJ5SXRlbSIsInNraXAiLCJ0b3AiLCJmb3JtYXQiLCJpbmxpbmVjb3VudCIsInNlbGVjdCIsInNlbGVjdEl0ZW0iLCJhbGxPcGVyYXRpb25zSW5TY2hlbWEiLCJzZWxlY3RQcm9wZXJ0eSIsInNlbGVjdFBhdGgiLCJxdWFsaWZpZWRBY3Rpb25OYW1lIiwicXVhbGlmaWVkRnVuY3Rpb25OYW1lIiwic2tpcHRva2VuIiwiYWxpYXNBbmRWYWx1ZSJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBWSxLQUFLLFdBQU0sU0FBUyxDQUFDLENBQUE7QUFDakMsSUFBWSxLQUFLLFdBQU0sU0FBUyxDQUFDLENBQUE7QUFDakMsSUFBWSxnQkFBZ0IsV0FBTSxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3ZELElBQVksZ0JBQWdCLFdBQU0sb0JBQW9CLENBQUMsQ0FBQTtBQUN2RCxJQUFZLFdBQVcsV0FBTSxlQUFlLENBQUMsQ0FBQTtBQUU3QyxzQkFBNkIsS0FBMkIsRUFBRSxLQUFZO0lBQ3JFQSxJQUFJQSxLQUFLQSxHQUFHQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7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QixDQUFBO0FBRUQsc0JBQTZCLEtBQTJCLEVBQUUsS0FBWTtJQUNyRUMsSUFBSUEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDN0NBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ2xCQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNsQkEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFFYkEsSUFBSUEsVUFBVUEsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDdkJBLElBQUlBLEVBQUVBLEdBQUdBLEtBQUtBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDOUNBLE9BQU9BLEVBQUVBLEdBQUdBLEtBQUtBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLEVBQUNBLENBQUNBO1FBQzdFQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNYQSxFQUFFQSxHQUFHQSxLQUFLQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQzNDQSxDQUFDQTtJQUNEQSxJQUFJQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUVyQkEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDekNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ2xCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUViQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxVQUFVQSxFQUFFQSxRQUFRQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtBQUN4SEEsQ0FBQ0E7QUFuQmUsb0JBQVksZUFtQjNCLENBQUE7QUFFRCxvQkFBMkIsS0FBMkIsRUFBRSxLQUFZO0lBQ25FQyxJQUFJQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN4REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbEJBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUViQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtJQUNsRkEsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7SUFDeEJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0FBQ2RBLENBQUNBO0FBVGUsa0JBQVUsYUFTekIsQ0FBQTtBQUVELHlCQUFnQyxLQUEyQixFQUFFLEtBQVk7SUFDeEVDLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3BDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNsQkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2JBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBRWhDQSxJQUFJQSxJQUFJQSxHQUFHQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO0lBRWxCQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNoQ0EsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDdENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ25CQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUVkQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBO0FBQ3pGQSxDQUFDQTtBQWpCZSx1QkFBZSxrQkFpQjlCLENBQUE7QUFFRCxnQkFBdUIsS0FBMkIsRUFBRSxLQUFZO0lBQy9EQyxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNuREEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO0lBRVhBLElBQUlBLEVBQUVBLEdBQUdBLEtBQUtBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFFWEEsSUFBSUEsS0FBS0EsQ0FBQ0E7SUFDVkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQUEsQ0FBQ0E7UUFDdENBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2RBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO0lBQ1pBLENBQUNBO0lBQUFBLElBQUlBLENBQUFBLENBQUNBO1FBQ0xBLElBQUlBLEtBQUtBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDdERBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBO1FBQ25CQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUNsQkEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0lBRURBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQzNFQSxDQUFDQTtBQXJCZSxjQUFNLFNBcUJyQixDQUFBO0FBRUQsZ0JBQXVCLEtBQTJCLEVBQUUsS0FBWTtJQUMvREMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkRBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUVYQSxJQUFJQSxFQUFFQSxHQUFHQSxLQUFLQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNoQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLEtBQUtBLEdBQUdBLEVBQUVBLENBQUNBO0lBRVhBLElBQUlBLElBQUlBLEdBQUdBLFdBQVdBLENBQUNBLGNBQWNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3BEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNsQkEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFFbEJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQzFFQSxDQUFDQTtBQWRlLGNBQU0sU0FjckIsQ0FBQTtBQUVELGlCQUF3QixLQUEyQixFQUFFLEtBQVk7SUFDaEVDLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ3BEQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNsQkEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFFWEEsSUFBSUEsRUFBRUEsR0FBR0EsS0FBS0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDaENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUVYQSxJQUFJQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUNmQSxJQUFJQSxLQUFLQSxHQUFHQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO0lBRW5CQSxPQUFPQSxLQUFLQSxFQUFDQSxDQUFDQTtRQUNiQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUVsQkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUFBLENBQUNBO1lBQ1ZBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ2RBLElBQUlBLEtBQUtBLEdBQUdBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0E7WUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUFBQSxJQUFJQTtZQUFDQSxLQUFLQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxFQUFFQSxPQUFBQSxLQUFLQSxFQUFFQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUNoRkEsQ0FBQ0E7QUEzQmUsZUFBTyxVQTJCdEIsQ0FBQTtBQUVELHFCQUE0QixLQUEyQixFQUFFLEtBQVk7SUFDcEVDLElBQUlBLElBQUlBLEdBQUdBLFdBQVdBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNsQkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO0lBRWxCQSxJQUFJQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNsQkEsSUFBSUEsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDbENBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLENBQUFBLENBQUNBO1FBQ2hCQSxLQUFLQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUNaQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNsREEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQUEsQ0FBQ0E7WUFDNUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQ1hBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUFBQSxJQUFJQTtZQUFDQSxNQUFNQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVEQSxNQUFNQSxDQUFDQSxL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QUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUVYQSxJQUFJQSxFQUFFQSxHQUFHQSxLQUFLQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNoQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLEtBQUtBLEdBQUdBLEVBQUVBLENBQUNBO0lBRVhBLElBQUlBLE1BQU1BLENBQUNBO0lBQ1hBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBLENBQUFBLENBQUNBO1FBQ3ZDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNoQkEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDWkEsQ0FBQ0E7SUFBQUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQUEsQ0FBQ0E7UUFDN0NBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ2hCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUNaQSxDQUFDQTtJQUFBQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFBQSxDQUFDQTtRQUM1Q0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDZkEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDWkEsQ0FBQ0E7SUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsRUFBRUEsUUFBQUEsTUFBTUEsRUFBRUEsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDNUZBLENBQUNBO0FBdEJlLGNBQU0sU0FzQnJCLENBQUE7QUFFRCxxQkFBNEIsS0FBMkIsRUFBRSxLQUFZO0lBQ3BFQyxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNsREEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO0lBRVhBLElBQUlBLEVBQUVBLEdBQUdBLEtBQUtBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFFWEEsSUFBSUEsS0FBS0EsR0FBR0EsZ0JBQWdCQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN4REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO0lBRW5CQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtBQUNoRkEsQ0FBQ0E7QUFkZSxtQkFBVyxjQWMxQixDQUFBO0FBRUQsY0FBYztBQUVkLGdCQUF1QixLQUEyQixFQUFFLEtBQVk7SUFDL0RDLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ25EQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNsQkEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFFWEEsSUFBSUEsRUFBRUEsR0FBR0EsS0FBS0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDaENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUVYQSxJQUFJQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUNmQSxJQUFJQSxLQUFLQSxHQUFHQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkJBLE9BQU9BLEtBQUtBLEVBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xCQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUVuQkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUFBLENBQUNBO1lBQ1ZBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ2RBLEtBQUtBLEdBQUdBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtnQkFB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QSxFQUFFQSxDQUFDQTtJQUVYQSxJQUFJQSxVQUFVQSxHQUFHQSxXQUFXQSxDQUFDQSxjQUFjQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUMxREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDeEJBLEtBQUtBLEdBQUdBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBO0lBRXhCQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQTtRQUMxQ0EsT0FBQUEsS0FBS0E7UUFDTEEsS0FBS0EsRUFBRUEsVUFBVUE7S0FDakJBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO0FBQ25DQSxDQUFDQTtBQWxCZSxxQkFBYSxnQkFrQjVCLENBQUE7QUFFRCx5QkFBeUIiLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VSb290IjoiLi4vc3JjIn0=
