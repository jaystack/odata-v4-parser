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
function keyPredicate(value, index, metadataContext) {
    return simpleKey(value, index, metadataContext) ||
        compoundKey(value, index);
}
exports.keyPredicate = keyPredicate;
function simpleKey(value, index, metadataContext) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    var token = keyPropertyValue(value, index);
    if (!token)
        return;
    var close = Lexer.CLOSE(value, token.next);
    if (!close)
        return;
    var key;
    if (typeof metadataContext == 'object' &&
        metadataContext.key &&
        metadataContext.key.propertyRefs &&
        metadataContext.key.propertyRefs[0] &&
        metadataContext.key.propertyRefs[0].name) {
        key = metadataContext.key.propertyRefs[0].name;
    }
    return Lexer.tokenize(value, start, close, { key: key, value: token }, Lexer.TokenType.SimpleKey);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUksQ0FBQztBQUZlLGlCQUFTLFlBRXhCLENBQUE7QUFFRCxrQkFBeUIsS0FBMkIsRUFBRSxLQUFZO0lBQzlELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ2xELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixLQUFLLElBQUksQ0FBQyxDQUFDO0lBRVgsSUFBSSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RCxJQUFJLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO0lBQzdCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUEsQ0FBQztRQUMzQixNQUFNLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNwQixLQUFLLEdBQUc7WUFDSixNQUFNLEVBQUUsTUFBTTtTQUNqQixDQUFDO0lBQ04sQ0FBQztJQUFBLElBQUk7UUFBQyxLQUFLLEdBQUc7WUFDVixTQUFTLEVBQUUsU0FBUztZQUNwQixJQUFJLEVBQUUsU0FBUztTQUNsQixDQUFBO0lBRUQsS0FBSyxHQUFHLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNuQyxJQUFJLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0MsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFFMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7UUFDdkMsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQUUsR0FBRztLQUNaLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBM0JlLGdCQUFRLFdBMkJ2QixDQUFBIiwiZmlsZSI6ImV4cHJlc3Npb25zLmpzIiwic291cmNlUm9vdCI6Ii4uL3NyYyJ9
