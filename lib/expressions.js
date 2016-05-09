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
        substringOfMethodCallExpr(value, index) ||
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
function substringOfMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'substringof', 2); }
exports.substringOfMethodCallExpr = substringOfMethodCallExpr;
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
    return Lexer.tokenize(value, start, next.next, token ? { name: token, value: next } : next, Lexer.TokenType.MemberExpression);
}
exports.memberExpr = memberExpr;
function propertyPathExpr(value, index) {
    var token = NameOrIdentifier.odataIdentifier(value, index);
    var start = index;
    if (token) {
        index = token.next;
        var nav = collectionPathExpr(value, token.next) ||
            collectionNavigationExpr(value, token.next) ||
            singleNavigationExpr(value, token.next) ||
            complexPathExpr(value, token.next) ||
            singlePathExpr(value, token.next);
        if (nav) {
            index = nav.next;
            token = {
                current: Lexer.clone(token),
                next: nav
            };
        }
    }
    else if (!token) {
        token = NameOrIdentifier.streamProperty(value, index);
        if (token)
            index = token.next;
    }
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.PropertyPathExpression);
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
        index = predicate.next;
        navigation = singleNavigationExpr(value, index);
        if (navigation)
            index = navigation.next;
    }
    else {
        path = collectionPathExpr(value, index);
        if (path)
            index = path.next;
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
    if (!prop)
        return;
    var eq = Lexer.EQ(value, prop.next);
    if (!eq)
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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
