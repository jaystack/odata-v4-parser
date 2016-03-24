"use strict";
var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
var NameOrIdentifier = require('./nameOrIdentifier');
var ArrayOrObject = require('./json');
function commonExpr(value, index) {
    var token = PrimitiveLiteral.primitiveLiteral(value, index) ||
        parameterAlias(value, index) ||
        ArrayOrObject.arrayOrObject(value, index) ||
        rootExpr(value, index) ||
        methodCallExpr(value, index) ||
        firstMemberExpr(value, index) ||
        functionExpr(value, index) ||
        negateExpr(value, index) ||
        parenExpr(value, index) ||
        castExpr(value, index);
    if (!token)
        return;
    var expr = addExpr(value, token.next) ||
        subExpr(value, token.next) ||
        mulExpr(value, token.next) ||
        divExpr(value, token.next) ||
        modExpr(value, token.next);
    if (expr) {
        token.value = {
            left: Lexer.clone(token),
            right: expr.value
        };
        token.next = expr.value.next;
        token.type = expr.type;
        token.raw = Utils.stringify(value, token.position, token.next);
    }
    if (token)
        return Lexer.tokenize(value, token.position, token.next, token, Lexer.TokenType.CommonExpression);
}
exports.commonExpr = commonExpr;
;
function boolCommonExpr(value, index) {
    var token = isofExpr(value, index) ||
        boolMethodCallExpr(value, index) ||
        notExpr(value, index) ||
        commonExpr(value, index) ||
        boolParenExpr(value, index);
    if (!token)
        return;
    var commonMoreExpr = undefined;
    if (token.type == Lexer.TokenType.CommonExpression) {
        commonMoreExpr = eqExpr(value, token.next) ||
            neExpr(value, token.next) ||
            ltExpr(value, token.next) ||
            leExpr(value, token.next) ||
            gtExpr(value, token.next) ||
            geExpr(value, token.next) ||
            hasExpr(value, token.next);
        if (commonMoreExpr) {
            token.value = {
                left: token.value,
                right: commonMoreExpr.value
            };
            token.next = commonMoreExpr.value.next;
            token.type = commonMoreExpr.type;
            token.raw = Utils.stringify(value, token.position, token.next);
        }
    }
    var expr = andExpr(value, token.next) ||
        orExpr(value, token.next);
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
exports.boolCommonExpr = boolCommonExpr;
;
function andExpr(value, index) {
    var rws = Lexer.RWS(value, index);
    if (rws == index || !Utils.equals(value, rws, 'and'))
        return;
    var start = index;
    index = rws + 3;
    rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = boolCommonExpr(value, index);
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.AndExpression);
}
exports.andExpr = andExpr;
;
function orExpr(value, index) {
    var rws = Lexer.RWS(value, index);
    if (rws == index || !Utils.equals(value, rws, 'or'))
        return;
    var start = index;
    index = rws + 2;
    rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = boolCommonExpr(value, index);
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.OrExpression);
}
exports.orExpr = orExpr;
;
function leftRightExpr(value, index, expr, tokenType) {
    var rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    var start = index;
    index = rws;
    if (!Utils.equals(value, index, expr))
        return;
    index += expr.length;
    rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = commonExpr(value, index);
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token.value, tokenType);
}
exports.leftRightExpr = leftRightExpr;
;
function eqExpr(value, index) { return leftRightExpr(value, index, 'eq', Lexer.TokenType.EqualsExpression); }
exports.eqExpr = eqExpr;
function neExpr(value, index) { return leftRightExpr(value, index, 'ne', Lexer.TokenType.NotEqualsExpression); }
exports.neExpr = neExpr;
function ltExpr(value, index) { return leftRightExpr(value, index, 'lt', Lexer.TokenType.LesserThanExpression); }
exports.ltExpr = ltExpr;
function leExpr(value, index) { return leftRightExpr(value, index, 'le', Lexer.TokenType.LesserOrEqualsExpression); }
exports.leExpr = leExpr;
function gtExpr(value, index) { return leftRightExpr(value, index, 'gt', Lexer.TokenType.GreaterThanExpression); }
exports.gtExpr = gtExpr;
function geExpr(value, index) { return leftRightExpr(value, index, 'ge', Lexer.TokenType.GreaterOrEqualsExpression); }
exports.geExpr = geExpr;
function hasExpr(value, index) { return leftRightExpr(value, index, 'has', Lexer.TokenType.HasExpression); }
exports.hasExpr = hasExpr;
function addExpr(value, index) { return leftRightExpr(value, index, 'add', Lexer.TokenType.AddExpression); }
exports.addExpr = addExpr;
function subExpr(value, index) { return leftRightExpr(value, index, 'sub', Lexer.TokenType.SubExpression); }
exports.subExpr = subExpr;
function mulExpr(value, index) { return leftRightExpr(value, index, 'mul', Lexer.TokenType.MulExpression); }
exports.mulExpr = mulExpr;
function divExpr(value, index) { return leftRightExpr(value, index, 'div', Lexer.TokenType.DivExpression); }
exports.divExpr = divExpr;
function modExpr(value, index) { return leftRightExpr(value, index, 'mod', Lexer.TokenType.ModExpression); }
exports.modExpr = modExpr;
function notExpr(value, index) {
    if (!Utils.equals(value, index, 'not'))
        return;
    var start = index;
    index += 3;
    var rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = boolCommonExpr(value, index);
    if (!token)
        return;
    return Lexer.tokenize(value, start, token.next, token, Lexer.TokenType.NotExpression);
}
exports.notExpr = notExpr;
;
function boolParenExpr(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    index = Lexer.BWS(value, index);
    var token = boolCommonExpr(value, index);
    if (!token)
        return;
    index = Lexer.BWS(value, token.next);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.BoolParenExpression);
}
exports.boolParenExpr = boolParenExpr;
;
function parenExpr(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    index = Lexer.BWS(value, index);
    var token = commonExpr(value, index);
    if (!token)
        return;
    index = Lexer.BWS(value, token.next);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, token.value, Lexer.TokenType.ParenExpression);
}
exports.parenExpr = parenExpr;
;
function boolMethodCallExpr(value, index) {
    return endsWithMethodCallExpr(value, index) ||
        startsWithMethodCallExpr(value, index) ||
        containsMethodCallExpr(value, index) ||
        intersectsMethodCallExpr(value, index);
}
exports.boolMethodCallExpr = boolMethodCallExpr;
;
function methodCallExpr(value, index) {
    return indexOfMethodCallExpr(value, index) ||
        toLowerMethodCallExpr(value, index) ||
        toUpperMethodCallExpr(value, index) ||
        trimMethodCallExpr(value, index) ||
        substringMethodCallExpr(value, index) ||
        concatMethodCallExpr(value, index) ||
        lengthMethodCallExpr(value, index) ||
        yearMethodCallExpr(value, index) ||
        monthMethodCallExpr(value, index) ||
        dayMethodCallExpr(value, index) ||
        hourMethodCallExpr(value, index) ||
        minuteMethodCallExpr(value, index) ||
        secondMethodCallExpr(value, index) ||
        fractionalsecondsMethodCallExpr(value, index) ||
        totalsecondsMethodCallExpr(value, index) ||
        dateMethodCallExpr(value, index) ||
        timeMethodCallExpr(value, index) ||
        roundMethodCallExpr(value, index) ||
        floorMethodCallExpr(value, index) ||
        ceilingMethodCallExpr(value, index) ||
        distanceMethodCallExpr(value, index) ||
        geoLengthMethodCallExpr(value, index) ||
        totalOffsetMinutesMethodCallExpr(value, index) ||
        minDateTimeMethodCallExpr(value, index) ||
        maxDateTimeMethodCallExpr(value, index) ||
        nowMethodCallExpr(value, index);
}
exports.methodCallExpr = methodCallExpr;
;
function methodCallExprFactory(value, index, method, min, max) {
    if (typeof min == 'undefined')
        min = 0;
    if (typeof max == 'undefined')
        max = min;
    if (!Utils.equals(value, index, method))
        return;
    var start = index;
    index += method.length;
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    index = open;
    index = Lexer.BWS(value, index);
    var parameters;
    if (min > 0) {
        parameters = [];
        while (parameters.length < max) {
            var expr = commonExpr(value, index);
            if (parameters.length < min && !expr)
                return;
            else if (expr) {
                parameters.push(expr.value);
                index = expr.next;
                index = Lexer.BWS(value, index);
                var comma = Lexer.COMMA(value, index);
                if (parameters.length < min && !comma)
                    return;
                if (comma)
                    index = comma;
                else
                    break;
                index = Lexer.BWS(value, index);
            }
            else
                break;
        }
    }
    index = Lexer.BWS(value, index);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, {
        method: method,
        parameters: parameters
    }, Lexer.TokenType.MethodCallExpression);
}
exports.methodCallExprFactory = methodCallExprFactory;
;
function containsMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'contains', 2); }
exports.containsMethodCallExpr = containsMethodCallExpr;
function startsWithMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'startswith', 2); }
exports.startsWithMethodCallExpr = startsWithMethodCallExpr;
function endsWithMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'endswith', 2); }
exports.endsWithMethodCallExpr = endsWithMethodCallExpr;
function lengthMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'length', 1); }
exports.lengthMethodCallExpr = lengthMethodCallExpr;
function indexOfMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'indexof', 2); }
exports.indexOfMethodCallExpr = indexOfMethodCallExpr;
function substringMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'substring', 2, 3); }
exports.substringMethodCallExpr = substringMethodCallExpr;
function toLowerMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'tolower', 1); }
exports.toLowerMethodCallExpr = toLowerMethodCallExpr;
function toUpperMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'toupper', 1); }
exports.toUpperMethodCallExpr = toUpperMethodCallExpr;
function trimMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'trim', 1); }
exports.trimMethodCallExpr = trimMethodCallExpr;
function concatMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'concat', 2); }
exports.concatMethodCallExpr = concatMethodCallExpr;
function yearMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'year', 1); }
exports.yearMethodCallExpr = yearMethodCallExpr;
function monthMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'month', 1); }
exports.monthMethodCallExpr = monthMethodCallExpr;
function dayMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'day', 1); }
exports.dayMethodCallExpr = dayMethodCallExpr;
function hourMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'hour', 1); }
exports.hourMethodCallExpr = hourMethodCallExpr;
function minuteMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'minute', 1); }
exports.minuteMethodCallExpr = minuteMethodCallExpr;
function secondMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'second', 1); }
exports.secondMethodCallExpr = secondMethodCallExpr;
function fractionalsecondsMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'fractionalseconds', 1); }
exports.fractionalsecondsMethodCallExpr = fractionalsecondsMethodCallExpr;
function totalsecondsMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'totalseconds', 1); }
exports.totalsecondsMethodCallExpr = totalsecondsMethodCallExpr;
function dateMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'date', 1); }
exports.dateMethodCallExpr = dateMethodCallExpr;
function timeMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'time', 1); }
exports.timeMethodCallExpr = timeMethodCallExpr;
function totalOffsetMinutesMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'totaloffsetminutes', 1); }
exports.totalOffsetMinutesMethodCallExpr = totalOffsetMinutesMethodCallExpr;
function minDateTimeMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'mindatetime', 0); }
exports.minDateTimeMethodCallExpr = minDateTimeMethodCallExpr;
function maxDateTimeMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'maxdatetime', 0); }
exports.maxDateTimeMethodCallExpr = maxDateTimeMethodCallExpr;
function nowMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'now', 0); }
exports.nowMethodCallExpr = nowMethodCallExpr;
function roundMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'round', 1); }
exports.roundMethodCallExpr = roundMethodCallExpr;
function floorMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'floor', 1); }
exports.floorMethodCallExpr = floorMethodCallExpr;
function ceilingMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'ceiling', 1); }
exports.ceilingMethodCallExpr = ceilingMethodCallExpr;
function distanceMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'geo.distance', 2); }
exports.distanceMethodCallExpr = distanceMethodCallExpr;
function geoLengthMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'geo.length', 1); }
exports.geoLengthMethodCallExpr = geoLengthMethodCallExpr;
function intersectsMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'geo.intersects', 2); }
exports.intersectsMethodCallExpr = intersectsMethodCallExpr;
function isofExpr(value, index) {
    if (!Utils.equals(value, index, 'isof'))
        return;
    var start = index;
    index += 4;
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    index = open;
    index = Lexer.BWS(value, index);
    var expr = commonExpr(value, index);
    if (expr) {
        index = expr.next;
        index = Lexer.BWS(value, index);
        var comma = Lexer.COMMA(value, index);
        if (!comma)
            return;
        index = comma;
        index = Lexer.BWS(value, index);
    }
    var typeName = NameOrIdentifier.qualifiedTypeName(value, index);
    if (!typeName)
        return;
    index = typeName.next;
    index = Lexer.BWS(value, index);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, {
        target: expr,
        typename: typeName
    }, Lexer.TokenType.IsOfExpression);
}
exports.isofExpr = isofExpr;
function castExpr(value, index) {
    if (!Utils.equals(value, index, 'cast'))
        return;
    var start = index;
    index += 4;
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    index = open;
    index = Lexer.BWS(value, index);
    var expr = commonExpr(value, index);
    if (expr) {
        index = expr.next;
        index = Lexer.BWS(value, index);
        var comma = Lexer.COMMA(value, index);
        if (!comma)
            return;
        index = comma;
        index = Lexer.BWS(value, index);
    }
    var typeName = NameOrIdentifier.qualifiedTypeName(value, index);
    if (!typeName)
        return;
    index = typeName.next;
    index = Lexer.BWS(value, index);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, {
        target: expr,
        typename: typeName
    }, Lexer.TokenType.CastExpression);
}
exports.castExpr = castExpr;
function negateExpr(value, index) {
    if (value[index] != 0x2d)
        return;
    var start = index;
    index++;
    index = Lexer.BWS(value, index);
    var expr = commonExpr(value, index);
    if (!expr)
        return;
    return Lexer.tokenize(value, start, expr.next, expr, Lexer.TokenType.NegateExpression);
}
exports.negateExpr = negateExpr;
function firstMemberExpr(value, index) {
    var token = inscopeVariableExpr(value, index);
    var member;
    var start = index;
    if (token) {
        if (value[token.next] == 0x2f) {
            index = token.next + 1;
            member = memberExpr(value, index);
            if (!member)
                return;
            return Lexer.tokenize(value, start, member.next, [token, member], Lexer.TokenType.FirstMemberExpression);
        }
    }
    else
        member = memberExpr(value, index);
    token = token || member;
    if (!token)
        return;
    return Lexer.tokenize(value, start, token.next, token, Lexer.TokenType.FirstMemberExpression);
}
exports.firstMemberExpr = firstMemberExpr;
function memberExpr(value, index) {
    var start = index;
    var token = NameOrIdentifier.qualifiedEntityTypeName(value, index);
    if (token) {
        if (value[token.next] != 0x2f)
            return;
        index = token.next + 1;
    }
    var next = propertyPathExpr(value, index) ||
        boundFunctionExpr(value, index);
    if (!next)
        return;
    return Lexer.tokenize(value, start, next.next, token ? { name: token, value: next } : { value: next }, Lexer.TokenType.MemberExpression);
}
exports.memberExpr = memberExpr;
function propertyPathExpr(value, index) {
    var token = NameOrIdentifier.odataIdentifier(value, index);
    if (token) {
        var nav = collectionPathExpr(value, token.next) ||
            collectionNavigationExpr(value, token.next) ||
            singleNavigationExpr(value, token.next) ||
            complexPathExpr(value, token.next) ||
            singlePathExpr(value, token.next);
        if (nav) {
            token.value = {
                current: Lexer.clone(token),
                next: nav
            };
            token.next = nav.next;
            token.raw = Utils.stringify(value, token.position, token.next);
        }
    }
    else
        token = token || NameOrIdentifier.streamProperty(value, index);
    if (!token)
        return;
    return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.PropertyPathExpression);
}
exports.propertyPathExpr = propertyPathExpr;
function inscopeVariableExpr(value, index) {
    return implicitVariableExpr(value, index) ||
        (isLambdaPredicate ? lambdaVariableExpr(value, index) : undefined);
}
exports.inscopeVariableExpr = inscopeVariableExpr;
function implicitVariableExpr(value, index) {
    if (Utils.equals(value, index, '$it'))
        return Lexer.tokenize(value, index, index + 3, '$it', Lexer.TokenType.ImplicitVariableExpression);
}
exports.implicitVariableExpr = implicitVariableExpr;
var isLambdaPredicate = false;
var hasLambdaVariableExpr = false;
function lambdaVariableExpr(value, index) {
    var token = NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.LambdaVariableExpression);
    if (token) {
        hasLambdaVariableExpr = true;
        return token;
    }
}
exports.lambdaVariableExpr = lambdaVariableExpr;
function lambdaPredicateExpr(value, index) {
    isLambdaPredicate = true;
    var token = boolCommonExpr(value, index);
    isLambdaPredicate = false;
    if (token && hasLambdaVariableExpr) {
        hasLambdaVariableExpr = false;
        return Lexer.tokenize(value, token.position, token.next, token, Lexer.TokenType.LambdaPredicateExpression);
    }
}
exports.lambdaPredicateExpr = lambdaPredicateExpr;
function anyExpr(value, index) {
    if (!Utils.equals(value, index, 'any'))
        return;
    var start = index;
    index += 3;
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    index = open;
    index = Lexer.BWS(value, index);
    var variable = lambdaVariableExpr(value, index);
    var predicate;
    if (variable) {
        index = variable.next;
        index = Lexer.BWS(value, index);
        var colon = Lexer.COLON(value, index);
        if (!colon)
            return;
        index = colon;
        index = Lexer.BWS(value, index);
        predicate = lambdaPredicateExpr(value, index);
        if (!predicate)
            return;
        index = predicate.next;
    }
    index = Lexer.BWS(value, index);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, {
        variable: variable,
        predicate: predicate
    }, Lexer.TokenType.AnyExpression);
}
exports.anyExpr = anyExpr;
function allExpr(value, index) {
    if (!Utils.equals(value, index, 'all'))
        return;
    var start = index;
    index += 3;
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    index = open;
    index = Lexer.BWS(value, index);
    var variable = lambdaVariableExpr(value, index);
    if (!variable)
        return;
    index = variable.next;
    index = Lexer.BWS(value, index);
    var colon = Lexer.COLON(value, index);
    if (!colon)
        return;
    index = colon;
    index = Lexer.BWS(value, index);
    var predicate = lambdaPredicateExpr(value, index);
    if (!predicate)
        return;
    index = predicate.next;
    index = Lexer.BWS(value, index);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, {
        variable: variable,
        predicate: predicate
    }, Lexer.TokenType.AllExpression);
}
exports.allExpr = allExpr;
function collectionNavigationExpr(value, index) {
    var start = index;
    var entity, predicate, navigation, path;
    if (value[index] == 0x2f) {
        index++;
        entity = NameOrIdentifier.qualifiedEntityTypeName(value, index);
        if (!entity)
            return;
        index = entity.next;
    }
    predicate = keyPredicate(value, index);
    if (predicate) {
        navigation = singleNavigationExpr(value, index);
    }
    else {
        path = collectionPathExpr(value, index);
    }
    if (index > start) {
        return Lexer.tokenize(value, start, index, {
            entity: entity,
            predicate: predicate,
            navigation: navigation,
            path: path
        }, Lexer.TokenType.CollectionNavigationExpression);
    }
}
exports.collectionNavigationExpr = collectionNavigationExpr;
function keyPredicate(value, index) {
    return simpleKey(value, index) ||
        compoundKey(value, index);
}
exports.keyPredicate = keyPredicate;
function simpleKey(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    var key = keyPropertyValue(value, index);
    if (!key)
        return;
    var close = Lexer.CLOSE(value, key.next);
    if (!close)
        return;
    return Lexer.tokenize(value, start, close, key, Lexer.TokenType.SimpleKey);
}
exports.simpleKey = simpleKey;
function compoundKey(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    var pair = keyValuePair(value, index);
    if (!pair)
        return;
    var keys = [];
    while (pair) {
        keys.push(pair);
        var comma = Lexer.COMMA(value, pair.next);
        if (comma)
            pair = keyValuePair(value, comma);
        else
            pair = null;
    }
    index = keys[keys.length - 1].next;
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, keys, Lexer.TokenType.CompoundKey);
}
exports.compoundKey = compoundKey;
function keyValuePair(value, index) {
    var prop = NameOrIdentifier.primitiveKeyProperty(value, index) ||
        keyPropertyAlias(value, index);
    var eq = Lexer.EQ(value, prop.next);
    if (!prop || !eq)
        return;
    var val = keyPropertyValue(value, eq);
    if (val)
        return Lexer.tokenize(value, index, val.next, {
            key: prop,
            value: val
        }, Lexer.TokenType.KeyValuePair);
}
exports.keyValuePair = keyValuePair;
function keyPropertyValue(value, index) {
    var token = PrimitiveLiteral.primitiveLiteral(value, index);
    if (token) {
        token.type = Lexer.TokenType.KeyPropertyValue;
        return token;
    }
}
exports.keyPropertyValue = keyPropertyValue;
function keyPropertyAlias(value, index) { return NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.KeyPropertyAlias); }
exports.keyPropertyAlias = keyPropertyAlias;
function singleNavigationExpr(value, index) {
    if (value[index] != 0x2f)
        return;
    var member = memberExpr(value, index + 1);
    if (member)
        return Lexer.tokenize(value, index, member.next, member, Lexer.TokenType.SingleNavigationExpression);
}
exports.singleNavigationExpr = singleNavigationExpr;
function collectionPathExpr(value, index) {
    var token = countExpr(value, index);
    if (!token) {
        if (value[index] == 0x2f) {
            token = boundFunctionExpr(value, index + 1) ||
                anyExpr(value, index + 1) ||
                allExpr(value, index + 1);
        }
    }
    if (token)
        return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.CollectionPathExpression);
}
exports.collectionPathExpr = collectionPathExpr;
function complexPathExpr(value, index) {
    if (value[index] != 0x2f)
        return;
    var start = index;
    index++;
    var token = NameOrIdentifier.qualifiedComplexTypeName(value, index);
    if (token) {
        if (value[token.next] != 0x2f)
            return;
        index = token.next + 1;
    }
    var expr = propertyPathExpr(value, index) ||
        boundFunctionExpr(value, index);
    if (expr)
        return Lexer.tokenize(value, start, expr.next, token ? [token, expr] : [expr], Lexer.TokenType.ComplexPathExpression);
}
exports.complexPathExpr = complexPathExpr;
function singlePathExpr(value, index) {
    if (value[index] != 0x2f)
        return;
    var boundFunction = boundFunctionExpr(value, index + 1);
    if (boundFunction)
        return Lexer.tokenize(value, index, boundFunction.next, boundFunction, Lexer.TokenType.SinglePathExpression);
}
exports.singlePathExpr = singlePathExpr;
function functionExpr(value, index) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var start = index;
    index = namespaceNext + 1;
    var token = NameOrIdentifier.odataIdentifier(value, index);
    if (!token)
        return;
    token.position = start;
    token.raw = Utils.stringify(value, start, token.next);
    index = token.next;
    var params = functionExprParameters(value, index);
    if (!params)
        return;
    index = params.next;
    var expr = collectionPathExpr(value, index) ||
        collectionNavigationExpr(value, index) ||
        singleNavigationExpr(value, index) ||
        complexPathExpr(value, index) ||
        singlePathExpr(value, index);
    if (expr)
        index = expr.next;
    return Lexer.tokenize(value, start, index, {
        fn: token,
        params: params,
        expression: expr
    }, Lexer.TokenType.FunctionExpression);
}
exports.functionExpr = functionExpr;
function boundFunctionExpr(value, index) { return functionExpr(value, index); }
exports.boundFunctionExpr = boundFunctionExpr;
function functionExprParameters(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    var params = [];
    var expr = functionExprParameter(value, index);
    while (expr) {
        params.push(expr);
        var comma = Lexer.COMMA(value, expr.next);
        if (comma) {
            index = comma;
            expr = functionExprParameter(value, index);
            if (!expr)
                return;
        }
        else {
            index = expr.next;
            expr = null;
        }
    }
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, params, Lexer.TokenType.FunctionExpressionParameters);
}
exports.functionExprParameters = functionExprParameters;
function functionExprParameter(value, index) {
    var name = parameterName(value, index);
    var eq = Lexer.EQ(value, name.next);
    if (!name || !eq)
        return;
    var start = index;
    index = eq;
    var param = parameterAlias(value, index) ||
        parameterValue(value, index);
    if (!param)
        return;
    return Lexer.tokenize(value, start, param.next, {
        name: name,
        value: param
    }, Lexer.TokenType.FunctionExpressionParameter);
}
exports.functionExprParameter = functionExprParameter;
function parameterName(value, index) { return NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.ParameterName); }
exports.parameterName = parameterName;
function parameterAlias(value, index) {
    var at = Lexer.AT(value, index);
    if (!at)
        return;
    var id = NameOrIdentifier.odataIdentifier(value, at);
    if (id)
        return Lexer.tokenize(value, index, id.next, id.value, Lexer.TokenType.ParameterAlias);
}
exports.parameterAlias = parameterAlias;
function parameterValue(value, index) {
    var token = ArrayOrObject.arrayOrObject(value, index) ||
        commonExpr(value, index);
    if (token)
        return Lexer.tokenize(value, index, token.next, token.value, Lexer.TokenType.ParameterValue);
}
exports.parameterValue = parameterValue;
function countExpr(value, index) {
    if (Utils.equals(value, index, '/$count'))
        return Lexer.tokenize(value, index, index + 7, '/$count', Lexer.TokenType.CountExpression);
}
exports.countExpr = countExpr;
function refExpr(value, index) {
    if (Utils.equals(value, index, '/$ref'))
        return Lexer.tokenize(value, index, index + 5, '/$ref', Lexer.TokenType.RefExpression);
}
exports.refExpr = refExpr;
function valueExpr(value, index) {
    if (Utils.equals(value, index, '/$value'))
        return Lexer.tokenize(value, index, index + 7, '/$value', Lexer.TokenType.ValueExpression);
}
exports.valueExpr = valueExpr;
function rootExpr(value, index) {
    if (!Utils.equals(value, index, '$root/'))
        return;
    var start = index;
    index += 6;
    var entitySet = NameOrIdentifier.entitySetName(value, index);
    var predicate, entity, token;
    if (entitySet)
        predicate = keyPredicate(value, entitySet.next);
    if (!(entitySet && predicate)) {
        entity = NameOrIdentifier.singletonEntity(value, index);
        if (!entity)
            return;
        token = {
            entity: entity
        };
    }
    else
        token = {
            entitySet: entitySet,
            keys: predicate
        };
    index = (predicate || entity).next;
    var nav = singleNavigationExpr(value, index);
    if (nav)
        index = nav.next;
    return Lexer.tokenize(value, start, index, {
        current: token,
        next: nav
    }, Lexer.TokenType.RootExpression);
}
exports.rootExpr = rootExpr;
//# sourceMappingURL=expressions.js.map