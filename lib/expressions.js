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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4cHJlc3Npb25zLnRzIl0sIm5hbWVzIjpbImNvbW1vbkV4cHIiLCJib29sQ29tbW9uRXhwciIsImFuZEV4cHIiLCJvckV4cHIiLCJsZWZ0UmlnaHRFeHByIiwiZXFFeHByIiwibmVFeHByIiwibHRFeHByIiwibGVFeHByIiwiZ3RFeHByIiwiZ2VFeHByIiwiaGFzRXhwciIsImFkZEV4cHIiLCJzdWJFeHByIiwibXVsRXhwciIsImRpdkV4cHIiLCJtb2RFeHByIiwibm90RXhwciIsImJvb2xQYXJlbkV4cHIiLCJwYXJlbkV4cHIiLCJib29sTWV0aG9kQ2FsbEV4cHIiLCJtZXRob2RDYWxsRXhwciIsIm1ldGhvZENhbGxFeHByRmFjdG9yeSIsImNvbnRhaW5zTWV0aG9kQ2FsbEV4cHIiLCJzdGFydHNXaXRoTWV0aG9kQ2FsbEV4cHIiLCJlbmRzV2l0aE1ldGhvZENhbGxFeHByIiwibGVuZ3RoTWV0aG9kQ2FsbEV4cHIiLCJpbmRleE9mTWV0aG9kQ2FsbEV4cHIiLCJzdWJzdHJpbmdNZXRob2RDYWxsRXhwciIsInN1YnN0cmluZ09mTWV0aG9kQ2FsbEV4cHIiLCJ0b0xvd2VyTWV0aG9kQ2FsbEV4cHIiLCJ0b1VwcGVyTWV0aG9kQ2FsbEV4cHIiLCJ0cmltTWV0aG9kQ2FsbEV4cHIiLCJjb25jYXRNZXRob2RDYWxsRXhwciIsInllYXJNZXRob2RDYWxsRXhwciIsIm1vbnRoTWV0aG9kQ2FsbEV4cHIiLCJkYXlNZXRob2RDYWxsRXhwciIsImhvdXJNZXRob2RDYWxsRXhwciIsIm1pbnV0ZU1ldGhvZENhbGxFeHByIiwic2Vjb25kTWV0aG9kQ2FsbEV4cHIiLCJmcmFjdGlvbmFsc2Vjb25kc01ldGhvZENhbGxFeHByIiwidG90YWxzZWNvbmRzTWV0aG9kQ2FsbEV4cHIiLCJkYXRlTWV0aG9kQ2FsbEV4cHIiLCJ0aW1lTWV0aG9kQ2FsbEV4cHIiLCJ0b3RhbE9mZnNldE1pbnV0ZXNNZXRob2RDYWxsRXhwciIsIm1pbkRhdGVUaW1lTWV0aG9kQ2FsbEV4cHIiLCJtYXhEYXRlVGltZU1ldGhvZENhbGxFeHByIiwibm93TWV0aG9kQ2FsbEV4cHIiLCJyb3VuZE1ldGhvZENhbGxFeHByIiwiZmxvb3JNZXRob2RDYWxsRXhwciIsImNlaWxpbmdNZXRob2RDYWxsRXhwciIsImRpc3RhbmNlTWV0aG9kQ2FsbEV4cHIiLCJnZW9MZW5ndGhNZXRob2RDYWxsRXhwciIsImludGVyc2VjdHNNZXRob2RDYWxsRXhwciIsImlzb2ZFeHByIiwiY2FzdEV4cHIiLCJuZWdhdGVFeHByIiwiZmlyc3RNZW1iZXJFeHByIiwibWVtYmVyRXhwciIsInByb3BlcnR5UGF0aEV4cHIiLCJpbnNjb3BlVmFyaWFibGVFeHByIiwiaW1wbGljaXRWYXJpYWJsZUV4cHIiLCJsYW1iZGFWYXJpYWJsZUV4cHIiLCJsYW1iZGFQcmVkaWNhdGVFeHByIiwiYW55RXhwciIsImFsbEV4cHIiLCJjb2xsZWN0aW9uTmF2aWdhdGlvbkV4cHIiLCJrZXlQcmVkaWNhdGUiLCJzaW1wbGVLZXkiLCJjb21wb3VuZEtleSIsImtleVZhbHVlUGFpciIsImtleVByb3BlcnR5VmFsdWUiLCJrZXlQcm9wZXJ0eUFsaWFzIiwic2luZ2xlTmF2aWdhdGlvbkV4cHIiLCJjb2xsZWN0aW9uUGF0aEV4cHIiLCJjb21wbGV4UGF0aEV4cHIiLCJzaW5nbGVQYXRoRXhwciIsImZ1bmN0aW9uRXhwciIsImJvdW5kRnVuY3Rpb25FeHByIiwiZnVuY3Rpb25FeHByUGFyYW1ldGVycyIsImZ1bmN0aW9uRXhwclBhcmFtZXRlciIsInBhcmFtZXRlck5hbWUiLCJwYXJhbWV0ZXJBbGlhcyIsInBhcmFtZXRlclZhbHVlIiwiY291bnRFeHByIiwicmVmRXhwciIsInZhbHVlRXhwciIsInJvb3RFeHByIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUNqQyxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUNqQyxJQUFZLGdCQUFnQixXQUFNLG9CQUFvQixDQUFDLENBQUE7QUFDdkQsSUFBWSxnQkFBZ0IsV0FBTSxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3ZELElBQVksYUFBYSxXQUFNLFFBQVEsQ0FBQyxDQUFBO0FBRXhDLG9CQUEyQixLQUEyQixFQUFFLEtBQVk7SUFDbkVBLElBQUlBLEtBQUtBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUMxREEsY0FBY0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDNUJBLGFBQWFBLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ3pDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUN0QkEsY0FBY0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDNUJBLGVBQWVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQzdCQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUMxQkEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDeEJBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ3ZCQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUV4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFFbkJBLElBQUlBLElBQUlBLEdBQUdBLE9BQU9BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO1FBQ3BDQSxPQUFPQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUMxQkEsT0FBT0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDMUJBLE9BQU9BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO1FBQzFCQSxPQUFPQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUU1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0E7WUFDYkEsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDeEJBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBO1NBQ2pCQSxDQUFDQTtRQUNGQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUM3QkEsS0FBS0EsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDdkJBLEtBQUtBLENBQUNBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLFFBQVFBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQ2hFQSxDQUFDQTtJQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO0FBQzlHQSxDQUFDQTtBQS9CZSxrQkFBVSxhQStCekIsQ0FBQTtBQUFBLENBQUM7QUFFRix3QkFBK0IsS0FBMkIsRUFBRSxLQUFZO0lBQ3ZFQyxJQUFJQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUNqQ0Esa0JBQWtCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUNoQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDckJBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ3hCQSxhQUFhQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUU3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFFbkJBLElBQUlBLGNBQWNBLEdBQUdBLFNBQVNBLENBQUNBO0lBQy9CQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBO1FBQ3BEQSxjQUFjQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUMxQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDekJBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO1lBQ3pCQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUN6QkEsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDekJBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO1lBQ3pCQSxPQUFPQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUUzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBO2dCQUNiQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxLQUFLQTtnQkFDakJBLEtBQUtBLEVBQUVBLGNBQWNBLENBQUNBLEtBQUtBO2FBQzNCQSxDQUFDQTtZQUNGQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxjQUFjQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUN2Q0EsS0FBS0EsQ0FBQ0EsSUFBSUEsR0FBR0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDakNBLEtBQUtBLENBQUNBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLFFBQVFBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hFQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVEQSxJQUFJQSxJQUFJQSxHQUFHQSxPQUFPQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNwQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFFM0JBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ1ZBLEtBQUtBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO1FBQzdCQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQTtZQUNiQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUN4QkEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0E7U0FDakJBLENBQUNBO1FBQ0ZBLEtBQUtBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ3ZCQSxLQUFLQSxDQUFDQSxHQUFHQSxHQUFHQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUNoRUEsQ0FBQ0E7SUFFREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDZEEsQ0FBQ0E7QUE1Q2Usc0JBQWMsaUJBNEM3QixDQUFBO0FBQUEsQ0FBQztBQUVGLGlCQUF3QixLQUEyQixFQUFFLEtBQVk7SUFDaEVDLElBQUlBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2xDQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUM3REEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO0lBQ2hCQSxHQUFHQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUM5QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDekJBLEtBQUtBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ1pBLElBQUlBLEtBQUtBLEdBQUdBLGNBQWNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3pDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUVuQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7QUFDbEZBLENBQUNBO0FBWmUsZUFBTyxVQVl0QixDQUFBO0FBQUEsQ0FBQztBQUVGLGdCQUF1QixLQUEyQixFQUFFLEtBQVk7SUFDL0RDLElBQUlBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2xDQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUM1REEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO0lBQ2hCQSxHQUFHQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUM5QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDekJBLEtBQUtBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ1pBLElBQUlBLEtBQUtBLEdBQUdBLGNBQWNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3pDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUVuQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7QUFDakZBLENBQUNBO0FBWmUsY0FBTSxTQVlyQixDQUFBO0FBQUEsQ0FBQztBQUVGLHVCQUE4QixLQUEyQixFQUFFLEtBQVksRUFBRSxJQUFXLEVBQUUsU0FBeUI7SUFDOUdDLElBQUlBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2xDQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUN6QkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ1pBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQzlDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNyQkEsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDOUJBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLEtBQUtBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ3pCQSxLQUFLQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUNaQSxJQUFJQSxLQUFLQSxHQUFHQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFFbkJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO0FBQ3BFQSxDQUFDQTtBQWRlLHFCQUFhLGdCQWM1QixDQUFBO0FBQUEsQ0FBQztBQUNGLGdCQUF1QixLQUEyQixFQUFFLEtBQVksSUFBZ0JDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBN0ksY0FBTSxTQUF1SSxDQUFBO0FBQzdKLGdCQUF1QixLQUEyQixFQUFFLEtBQVksSUFBZ0JDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBaEosY0FBTSxTQUEwSSxDQUFBO0FBQ2hLLGdCQUF1QixLQUEyQixFQUFFLEtBQVksSUFBZ0JDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBakosY0FBTSxTQUEySSxDQUFBO0FBQ2pLLGdCQUF1QixLQUEyQixFQUFFLEtBQVksSUFBZ0JDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLHdCQUF3QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBckosY0FBTSxTQUErSSxDQUFBO0FBQ3JLLGdCQUF1QixLQUEyQixFQUFFLEtBQVksSUFBZ0JDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBbEosY0FBTSxTQUE0SSxDQUFBO0FBQ2xLLGdCQUF1QixLQUEyQixFQUFFLEtBQVksSUFBZ0JDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLHlCQUF5QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBdEosY0FBTSxTQUFnSixDQUFBO0FBQ3RLLGlCQUF3QixLQUEyQixFQUFFLEtBQVksSUFBZ0JDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQTVJLGVBQU8sVUFBcUksQ0FBQTtBQUU1SixpQkFBd0IsS0FBMkIsRUFBRSxLQUFZLElBQWdCQyxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUE1SSxlQUFPLFVBQXFJLENBQUE7QUFDNUosaUJBQXdCLEtBQTJCLEVBQUUsS0FBWSxJQUFnQkMsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBNUksZUFBTyxVQUFxSSxDQUFBO0FBQzVKLGlCQUF3QixLQUEyQixFQUFFLEtBQVksSUFBZ0JDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQTVJLGVBQU8sVUFBcUksQ0FBQTtBQUM1SixpQkFBd0IsS0FBMkIsRUFBRSxLQUFZLElBQWdCQyxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUE1SSxlQUFPLFVBQXFJLENBQUE7QUFDNUosaUJBQXdCLEtBQTJCLEVBQUUsS0FBWSxJQUFnQkMsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBNUksZUFBTyxVQUFxSSxDQUFBO0FBRTVKLGlCQUF3QixLQUEyQixFQUFFLEtBQVk7SUFDaEVDLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQy9DQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNsQkEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDWEEsSUFBSUEsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDbENBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLEtBQUtBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ3pCQSxLQUFLQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUNaQSxJQUFJQSxLQUFLQSxHQUFHQSxjQUFjQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN6Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFFbkJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO0FBQ3ZGQSxDQUFDQTtBQVhlLGVBQU8sVUFXdEIsQ0FBQTtBQUFBLENBQUM7QUFFRix1QkFBOEIsS0FBMkIsRUFBRSxLQUFZO0lBQ3RFQyxJQUFJQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbEJBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNiQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNoQ0EsSUFBSUEsS0FBS0EsR0FBR0EsY0FBY0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDekNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ25CQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUNyQ0EsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDdENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ25CQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUVkQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBO0FBQ3hGQSxDQUFDQTtBQWRlLHFCQUFhLGdCQWM1QixDQUFBO0FBQUEsQ0FBQztBQUNGLG1CQUEwQixLQUEyQixFQUFFLEtBQVk7SUFDbEVDLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3BDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNsQkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2JBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hDQSxJQUFJQSxLQUFLQSxHQUFHQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQ3JDQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBRWRBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO0FBQzFGQSxDQUFDQTtBQWRlLGlCQUFTLFlBY3hCLENBQUE7QUFBQSxDQUFDO0FBRUYsNEJBQW1DLEtBQTJCLEVBQUUsS0FBWTtJQUMzRUMsTUFBTUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUMxQ0Esd0JBQXdCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUN0Q0Esc0JBQXNCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUNwQ0Esd0JBQXdCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxD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SUEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDcENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ2xCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNiQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNoQ0EsSUFBSUEsVUFBVUEsQ0FBQ0E7SUFDZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsVUFBVUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDaEJBLE9BQU9BLFVBQVVBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxJQUFJQSxHQUFHQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDZkEsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtnQkFDbEJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNoQ0EsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxFQUFF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Q0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDaERBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUNYQSxJQUFJQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2JBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hDQSxJQUFJQSxJQUFJQSxHQUFHQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbEJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2hDQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0E7UUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2RBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2pDQSxDQUFDQTtJQUNE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LEtBQUtBLENBQUNBLENBQUNBO1FBQ2hDQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0E7UUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2RBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2hDQSxTQUFTQSxHQUFHQSxtQkFBbUJBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQzlDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQTtRQUN2QkEsS0FBS0EsR0FBR0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBQ0RBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hDQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBRWRBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBO1FBQzFDQSxRQUFRQSxFQUFFQSxRQUFRQTtRQUNsQkEsU0FBU0EsRUFBRUEsU0FBU0E7S0FDcEJBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO0FBQ25DQSxDQUFDQTtBQTlCZSxlQUFPLFVBOEJ0QixDQUFBO0FBQ0QsaUJBQXdCLEtBQTJCLEVBQUUsS0FBWTtJQUNoRUMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDL0NBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUVYQSxJQUFJQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBRWJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hDQSxJQUFJQSxRQUFRQSxHQUFHQSxrQkFBa0JBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUN0QkEsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFFdEJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBRWhDQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBRWRBLEtBQUtBLEdBQUdBLEtBQUtBLENB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SUFDL0VDLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3BDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNsQkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBRWJBLElBQUlBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBO0lBQ2hCQSxJQUFJQSxJQUFJQSxHQUFHQSxxQkFBcUJBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQy9DQSxPQUFPQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNiQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNsQkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ1hBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ2RBLElBQUlBLEdBQUdBLHFCQUFxQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDM0NBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDbEJBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2JBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lB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
