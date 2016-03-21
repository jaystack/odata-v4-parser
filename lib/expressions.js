var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
var NameOrIdentifier = require('./nameOrIdentifier');
var ArrayOrObject = require('./json');
function commonExpr(value, index, metadata) {
    var token = PrimitiveLiteral.primitiveLiteral(value, index) ||
        parameterAlias(value, index) ||
        ArrayOrObject.arrayOrObject(value, index, metadata) ||
        rootExpr(value, index, metadata) ||
        methodCallExpr(value, index, metadata) ||
        firstMemberExpr(value, index, metadata) ||
        functionExpr(value, index, metadata) ||
        negateExpr(value, index, metadata) ||
        parenExpr(value, index, metadata) ||
        castExpr(value, index, metadata);
    if (!token)
        return;
    var expr = addExpr(value, token.next, metadata) ||
        subExpr(value, token.next, metadata) ||
        mulExpr(value, token.next, metadata) ||
        divExpr(value, token.next, metadata) ||
        modExpr(value, token.next, metadata);
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
function boolCommonExpr(value, index, metadata) {
    var token = isofExpr(value, index, metadata) ||
        boolMethodCallExpr(value, index, metadata) ||
        notExpr(value, index, metadata) ||
        commonExpr(value, index, metadata) ||
        boolParenExpr(value, index, metadata);
    if (!token)
        return;
    var commonMoreExpr = undefined;
    if (token.type == Lexer.TokenType.CommonExpression) {
        commonMoreExpr = eqExpr(value, token.next, metadata) ||
            neExpr(value, token.next, metadata) ||
            ltExpr(value, token.next, metadata) ||
            leExpr(value, token.next, metadata) ||
            gtExpr(value, token.next, metadata) ||
            geExpr(value, token.next, metadata) ||
            hasExpr(value, token.next, metadata);
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
    var expr = andExpr(value, token.next, metadata) ||
        orExpr(value, token.next, metadata);
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
function andExpr(value, index, metadata) {
    var rws = Lexer.RWS(value, index);
    if (rws == index || !Utils.equals(value, rws, 'and'))
        return;
    var start = index;
    index = rws + 3;
    rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = boolCommonExpr(value, index, metadata);
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.AndExpression);
}
exports.andExpr = andExpr;
;
function orExpr(value, index, metadata) {
    var rws = Lexer.RWS(value, index);
    if (rws == index || !Utils.equals(value, rws, 'or'))
        return;
    var start = index;
    index = rws + 2;
    rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = boolCommonExpr(value, index, metadata);
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.OrExpression);
}
exports.orExpr = orExpr;
;
function leftRightExpr(value, index, expr, tokenType, metadata) {
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
    var token = commonExpr(value, index, metadata);
    if (!token)
        return;
    return Lexer.tokenize(value, start, index, token.value, tokenType);
}
exports.leftRightExpr = leftRightExpr;
;
function eqExpr(value, index, metadata) { return leftRightExpr(value, index, 'eq', Lexer.TokenType.EqualsExpression, metadata); }
exports.eqExpr = eqExpr;
function neExpr(value, index, metadata) { return leftRightExpr(value, index, 'ne', Lexer.TokenType.NotEqualsExpression, metadata); }
exports.neExpr = neExpr;
function ltExpr(value, index, metadata) { return leftRightExpr(value, index, 'lt', Lexer.TokenType.LesserThanExpression, metadata); }
exports.ltExpr = ltExpr;
function leExpr(value, index, metadata) { return leftRightExpr(value, index, 'le', Lexer.TokenType.LesserOrEqualsExpression, metadata); }
exports.leExpr = leExpr;
function gtExpr(value, index, metadata) { return leftRightExpr(value, index, 'gt', Lexer.TokenType.GreaterThanExpression, metadata); }
exports.gtExpr = gtExpr;
function geExpr(value, index, metadata) { return leftRightExpr(value, index, 'ge', Lexer.TokenType.GreaterOrEqualsExpression, metadata); }
exports.geExpr = geExpr;
function hasExpr(value, index, metadata) { return leftRightExpr(value, index, 'has', Lexer.TokenType.HasExpression, metadata); }
exports.hasExpr = hasExpr;
function addExpr(value, index, metadata) { return leftRightExpr(value, index, 'add', Lexer.TokenType.AddExpression, metadata); }
exports.addExpr = addExpr;
function subExpr(value, index, metadata) { return leftRightExpr(value, index, 'sub', Lexer.TokenType.SubExpression, metadata); }
exports.subExpr = subExpr;
function mulExpr(value, index, metadata) { return leftRightExpr(value, index, 'mul', Lexer.TokenType.MulExpression, metadata); }
exports.mulExpr = mulExpr;
function divExpr(value, index, metadata) { return leftRightExpr(value, index, 'div', Lexer.TokenType.DivExpression, metadata); }
exports.divExpr = divExpr;
function modExpr(value, index, metadata) { return leftRightExpr(value, index, 'mod', Lexer.TokenType.ModExpression, metadata); }
exports.modExpr = modExpr;
function notExpr(value, index, metadata) {
    if (!Utils.equals(value, index, 'not'))
        return;
    var start = index;
    index += 3;
    var rws = Lexer.RWS(value, index);
    if (rws == index)
        return;
    index = rws;
    var token = boolCommonExpr(value, index, metadata);
    if (!token)
        return;
    return Lexer.tokenize(value, start, token.next, token, Lexer.TokenType.NotExpression);
}
exports.notExpr = notExpr;
;
function boolParenExpr(value, index, metadata) {
    if (!Lexer.OPEN(value[index]))
        return;
    var start = index;
    index++;
    index = Lexer.BWS(value, index);
    var token = boolCommonExpr(value, index, metadata);
    if (!token)
        return;
    index = Lexer.BWS(value, token.next);
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.BoolParenExpression);
}
exports.boolParenExpr = boolParenExpr;
;
function parenExpr(value, index, metadata) {
    if (!Lexer.OPEN(value[index]))
        return;
    var start = index;
    index++;
    index = Lexer.BWS(value, index);
    var token = commonExpr(value, index, metadata);
    if (!token)
        return;
    index = Lexer.BWS(value, token.next);
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, token.value, Lexer.TokenType.ParenExpression);
}
exports.parenExpr = parenExpr;
;
function boolMethodCallExpr(value, index, metadata) {
    return endsWithMethodCallExpr(value, index, metadata) ||
        startsWithMethodCallExpr(value, index, metadata) ||
        containsMethodCallExpr(value, index, metadata) ||
        intersectsMethodCallExpr(value, index, metadata);
}
exports.boolMethodCallExpr = boolMethodCallExpr;
;
function methodCallExpr(value, index, metadata) {
    return indexOfMethodCallExpr(value, index, metadata) ||
        toLowerMethodCallExpr(value, index, metadata) ||
        toUpperMethodCallExpr(value, index, metadata) ||
        trimMethodCallExpr(value, index, metadata) ||
        substringMethodCallExpr(value, index, metadata) ||
        concatMethodCallExpr(value, index, metadata) ||
        lengthMethodCallExpr(value, index, metadata) ||
        yearMethodCallExpr(value, index, metadata) ||
        monthMethodCallExpr(value, index, metadata) ||
        dayMethodCallExpr(value, index, metadata) ||
        hourMethodCallExpr(value, index, metadata) ||
        minuteMethodCallExpr(value, index, metadata) ||
        secondMethodCallExpr(value, index, metadata) ||
        fractionalsecondsMethodCallExpr(value, index, metadata) ||
        totalsecondsMethodCallExpr(value, index, metadata) ||
        dateMethodCallExpr(value, index, metadata) ||
        timeMethodCallExpr(value, index, metadata) ||
        roundMethodCallExpr(value, index, metadata) ||
        floorMethodCallExpr(value, index, metadata) ||
        ceilingMethodCallExpr(value, index, metadata) ||
        distanceMethodCallExpr(value, index, metadata) ||
        geoLengthMethodCallExpr(value, index, metadata) ||
        totalOffsetMinutesMethodCallExpr(value, index, metadata) ||
        minDateTimeMethodCallExpr(value, index, metadata) ||
        maxDateTimeMethodCallExpr(value, index, metadata) ||
        nowMethodCallExpr(value, index, metadata);
}
exports.methodCallExpr = methodCallExpr;
;
function methodCallExprFactory(value, index, metadata, method, min, max) {
    if (typeof min == 'undefined')
        min = 0;
    if (typeof max == 'undefined')
        max = min;
    if (!Utils.equals(value, index, method))
        return;
    var start = index;
    index += method.length;
    if (!Lexer.OPEN(value[index]))
        return;
    index++;
    index = Lexer.BWS(value, index);
    var parameters;
    if (min > 0) {
        parameters = [];
        while (parameters.length < max) {
            var expr = commonExpr(value, index, metadata);
            if (parameters.length < min && !expr)
                return;
            else if (expr) {
                parameters.push(expr.value);
                index = expr.next;
                index = Lexer.BWS(value, index);
                if (parameters.length < min && !Lexer.COMMA(value[index]))
                    return;
                if (Lexer.COMMA(value[index]))
                    index++;
                else
                    break;
                index = Lexer.BWS(value, index);
            }
            else
                break;
        }
    }
    index = Lexer.BWS(value, index);
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, {
        method: method,
        parameters: parameters
    }, Lexer.TokenType.MethodCallExpression);
}
exports.methodCallExprFactory = methodCallExprFactory;
;
function containsMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'contains', 2); }
exports.containsMethodCallExpr = containsMethodCallExpr;
function startsWithMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'startswith', 2); }
exports.startsWithMethodCallExpr = startsWithMethodCallExpr;
function endsWithMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'endswith', 2); }
exports.endsWithMethodCallExpr = endsWithMethodCallExpr;
function lengthMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'length', 1); }
exports.lengthMethodCallExpr = lengthMethodCallExpr;
function indexOfMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'indexof', 2); }
exports.indexOfMethodCallExpr = indexOfMethodCallExpr;
function substringMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'substring', 2, 3); }
exports.substringMethodCallExpr = substringMethodCallExpr;
function toLowerMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'tolower', 1); }
exports.toLowerMethodCallExpr = toLowerMethodCallExpr;
function toUpperMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'toupper', 1); }
exports.toUpperMethodCallExpr = toUpperMethodCallExpr;
function trimMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'trim', 1); }
exports.trimMethodCallExpr = trimMethodCallExpr;
function concatMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'concat', 2); }
exports.concatMethodCallExpr = concatMethodCallExpr;
function yearMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'year', 1); }
exports.yearMethodCallExpr = yearMethodCallExpr;
function monthMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'month', 1); }
exports.monthMethodCallExpr = monthMethodCallExpr;
function dayMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'day', 1); }
exports.dayMethodCallExpr = dayMethodCallExpr;
function hourMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'hour', 1); }
exports.hourMethodCallExpr = hourMethodCallExpr;
function minuteMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'minute', 1); }
exports.minuteMethodCallExpr = minuteMethodCallExpr;
function secondMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'second', 1); }
exports.secondMethodCallExpr = secondMethodCallExpr;
function fractionalsecondsMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'fractionalseconds', 1); }
exports.fractionalsecondsMethodCallExpr = fractionalsecondsMethodCallExpr;
function totalsecondsMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'totalseconds', 1); }
exports.totalsecondsMethodCallExpr = totalsecondsMethodCallExpr;
function dateMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'date', 1); }
exports.dateMethodCallExpr = dateMethodCallExpr;
function timeMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'time', 1); }
exports.timeMethodCallExpr = timeMethodCallExpr;
function totalOffsetMinutesMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'totaloffsetminutes', 1); }
exports.totalOffsetMinutesMethodCallExpr = totalOffsetMinutesMethodCallExpr;
function minDateTimeMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'mindatetime', 0); }
exports.minDateTimeMethodCallExpr = minDateTimeMethodCallExpr;
function maxDateTimeMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'maxdatetime', 0); }
exports.maxDateTimeMethodCallExpr = maxDateTimeMethodCallExpr;
function nowMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'now', 0); }
exports.nowMethodCallExpr = nowMethodCallExpr;
function roundMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'round', 1); }
exports.roundMethodCallExpr = roundMethodCallExpr;
function floorMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'floor', 1); }
exports.floorMethodCallExpr = floorMethodCallExpr;
function ceilingMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'ceiling', 1); }
exports.ceilingMethodCallExpr = ceilingMethodCallExpr;
function distanceMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'geo.distance', 2); }
exports.distanceMethodCallExpr = distanceMethodCallExpr;
function geoLengthMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'geo.length', 1); }
exports.geoLengthMethodCallExpr = geoLengthMethodCallExpr;
function intersectsMethodCallExpr(value, index, metadata) { return methodCallExprFactory(value, index, metadata, 'geo.intersects', 2); }
exports.intersectsMethodCallExpr = intersectsMethodCallExpr;
function isofExpr(value, index, metadata) {
    if (!Utils.equals(value, index, 'isof'))
        return;
    var start = index;
    index += 4;
    if (!Lexer.OPEN(value[index]))
        return;
    index++;
    index = Lexer.BWS(value, index);
    var expr = commonExpr(value, index, metadata);
    if (expr) {
        index = expr.next;
        index = Lexer.BWS(value, index);
        if (!Lexer.COMMA(value[index]))
            return;
        index++;
        index = Lexer.BWS(value, index);
    }
    var typeName = NameOrIdentifier.qualifiedTypeName(value, index, metadata);
    if (!typeName)
        return;
    index = typeName.next;
    index = Lexer.BWS(value, index);
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, {
        target: expr,
        typename: typeName
    }, Lexer.TokenType.IsOfExpression);
}
exports.isofExpr = isofExpr;
function castExpr(value, index, metadata) {
    if (!Utils.equals(value, index, 'cast'))
        return;
    var start = index;
    index += 4;
    if (!Lexer.OPEN(value[index]))
        return;
    index++;
    index = Lexer.BWS(value, index);
    var expr = commonExpr(value, index, metadata);
    if (expr) {
        index = expr.next;
        index = Lexer.BWS(value, index);
        if (!Lexer.COMMA(value[index]))
            return;
        index++;
        index = Lexer.BWS(value, index);
    }
    var typeName = NameOrIdentifier.qualifiedTypeName(value, index, metadata);
    if (!typeName)
        return;
    index = typeName.next;
    index = Lexer.BWS(value, index);
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, {
        target: expr,
        typename: typeName
    }, Lexer.TokenType.CastExpression);
}
exports.castExpr = castExpr;
function negateExpr(value, index, metadata) {
    if (value[index] != 0x2d)
        return;
    var start = index;
    index++;
    index = Lexer.BWS(value, index);
    var expr = commonExpr(value, index, metadata);
    if (!expr)
        return;
    return Lexer.tokenize(value, start, expr.next, expr, Lexer.TokenType.NegateExpression);
}
exports.negateExpr = negateExpr;
function firstMemberExpr(value, index, metadata) {
    var token = inscopeVariableExpr(value, index);
    var member;
    var start = index;
    if (token) {
        if (value[token.next] == 0x2f) {
            index = token.next + 1;
            member = memberExpr(value, index, metadata);
            if (!member)
                return;
            return Lexer.tokenize(value, start, member.next, [token, member], Lexer.TokenType.FirstMemberExpression);
        }
    }
    else
        member = memberExpr(value, index, metadata);
    token = token || member;
    if (!token)
        return;
    return Lexer.tokenize(value, start, token.next, token, Lexer.TokenType.FirstMemberExpression);
}
exports.firstMemberExpr = firstMemberExpr;
function memberExpr(value, index, metadata) {
    var start = index;
    var token = NameOrIdentifier.qualifiedEntityTypeName(value, index, metadata);
    if (token) {
        if (value[token.next] != 0x2f)
            return;
        index = token.next + 1;
    }
    var next = propertyPathExpr(value, index, metadata) ||
        boundFunctionExpr(value, index, metadata);
    if (!next)
        return;
    return Lexer.tokenize(value, start, next.next, token ? { name: token, value: next } : { value: next }, Lexer.TokenType.MemberExpression);
}
exports.memberExpr = memberExpr;
function propertyPathExpr(value, index, metadata) {
    //var token = NameOrIdentifier.odataIdentifier(value, index);
    var token = NameOrIdentifier.entityColNavigationProperty(value, index, metadata) ||
        NameOrIdentifier.entityNavigationProperty(value, index, metadata) ||
        NameOrIdentifier.complexColProperty(value, index, metadata) ||
        NameOrIdentifier.complexProperty(value, index, metadata) ||
        NameOrIdentifier.primitiveColProperty(value, index, metadata) ||
        NameOrIdentifier.primitiveProperty(value, index, metadata);
    if (token) {
        var nav = collectionPathExpr(value, token.next, metadata) ||
            collectionNavigationExpr(value, token.next, metadata) ||
            singleNavigationExpr(value, token.next, metadata) ||
            complexPathExpr(value, token.next, metadata) ||
            singlePathExpr(value, token.next, metadata);
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
        token = token || NameOrIdentifier.streamProperty(value, index, metadata);
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
function lambdaPredicateExpr(value, index, metadata) {
    isLambdaPredicate = true;
    var token = boolCommonExpr(value, index, metadata);
    isLambdaPredicate = false;
    if (token && hasLambdaVariableExpr) {
        hasLambdaVariableExpr = false;
        return Lexer.tokenize(value, token.position, token.next, token, Lexer.TokenType.LambdaPredicateExpression);
    }
}
exports.lambdaPredicateExpr = lambdaPredicateExpr;
function anyExpr(value, index, metadata) {
    if (!Utils.equals(value, index, 'any'))
        return;
    var start = index;
    index += 3;
    if (!Lexer.OPEN(value[index]))
        return;
    index++;
    index = Lexer.BWS(value, index);
    var variable = lambdaVariableExpr(value, index);
    var predicate;
    if (variable) {
        index = variable.next;
        index = Lexer.BWS(value, index);
        if (!Lexer.COLON(value[index]))
            return;
        index++;
        index = Lexer.BWS(value, index);
        predicate = lambdaPredicateExpr(value, index, metadata);
        if (!predicate)
            return;
        index = predicate.next;
    }
    index = Lexer.BWS(value, index);
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, {
        variable: variable,
        predicate: predicate
    }, Lexer.TokenType.AnyExpression);
}
exports.anyExpr = anyExpr;
function allExpr(value, index, metadata) {
    if (!Utils.equals(value, index, 'all'))
        return;
    var start = index;
    index += 3;
    if (!Lexer.OPEN(value[index]))
        return;
    index++;
    index = Lexer.BWS(value, index);
    var variable = lambdaVariableExpr(value, index);
    if (!variable)
        return;
    index = variable.next;
    index = Lexer.BWS(value, index);
    if (!Lexer.COLON(value[index]))
        return;
    index++;
    index = Lexer.BWS(value, index);
    var predicate = lambdaPredicateExpr(value, index, metadata);
    if (!predicate)
        return;
    index = predicate.next;
    index = Lexer.BWS(value, index);
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, {
        variable: variable,
        predicate: predicate
    }, Lexer.TokenType.AllExpression);
}
exports.allExpr = allExpr;
function collectionNavigationExpr(value, index, metadata) {
    var start = index;
    var entity, predicate, navigation, path;
    if (value[index] == 0x2f) {
        index++;
        entity = NameOrIdentifier.qualifiedEntityTypeName(value, index, metadata);
        if (!entity)
            return;
        index = entity.next;
    }
    predicate = keyPredicate(value, index, metadata);
    if (predicate) {
        navigation = singleNavigationExpr(value, index, metadata);
    }
    else {
        path = collectionPathExpr(value, index, metadata);
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
function keyPredicate(value, index, metadata) {
    return simpleKey(value, index) ||
        compoundKey(value, index, metadata);
}
exports.keyPredicate = keyPredicate;
function simpleKey(value, index) {
    if (!Lexer.OPEN(value[index]))
        return;
    var start = index;
    index++;
    var key = keyPropertyValue(value, index);
    if (!key || !Lexer.CLOSE(value[key.next]))
        return;
    return Lexer.tokenize(value, start, key.next + 1, key, Lexer.TokenType.SimpleKey);
}
exports.simpleKey = simpleKey;
function compoundKey(value, index, metadata) {
    if (!Lexer.OPEN(value[index]))
        return;
    var start = index;
    index++;
    var pair = keyValuePair(value, index, metadata);
    if (!pair)
        return;
    var keys = [];
    while (pair) {
        keys.push(pair);
        if (Lexer.COMMA(value[pair.next]))
            pair = keyValuePair(value, pair.next + 1, metadata);
        else
            pair = null;
    }
    index = keys[keys.length - 1].next;
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, keys, Lexer.TokenType.CompoundKey);
}
exports.compoundKey = compoundKey;
function keyValuePair(value, index, metadata) {
    var prop = NameOrIdentifier.primitiveKeyProperty(value, index, metadata) ||
        keyPropertyAlias(value, index);
    if (!prop || !Lexer.EQ(value[prop.next]))
        return;
    var val = keyPropertyValue(value, prop.next + 1);
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
function singleNavigationExpr(value, index, metadata) {
    if (value[index] != 0x2f)
        return;
    var member = memberExpr(value, index + 1, metadata);
    if (member)
        return Lexer.tokenize(value, index, member.next, member, Lexer.TokenType.SingleNavigationExpression);
}
exports.singleNavigationExpr = singleNavigationExpr;
function collectionPathExpr(value, index, metadata) {
    var token = countExpr(value, index);
    if (!token) {
        if (value[index] == 0x2f) {
            token = boundFunctionExpr(value, index + 1, metadata) ||
                anyExpr(value, index + 1, metadata) ||
                allExpr(value, index + 1, metadata);
        }
    }
    if (token)
        return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.CollectionPathExpression);
}
exports.collectionPathExpr = collectionPathExpr;
function complexPathExpr(value, index, metadata) {
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
    var expr = propertyPathExpr(value, index, metadata) ||
        boundFunctionExpr(value, index, metadata);
    if (expr)
        return Lexer.tokenize(value, start, expr.next, token ? [token, expr] : [expr], Lexer.TokenType.ComplexPathExpression);
}
exports.complexPathExpr = complexPathExpr;
function singlePathExpr(value, index, metadata) {
    if (value[index] != 0x2f)
        return;
    var boundFunction = boundFunctionExpr(value, index + 1, metadata);
    if (boundFunction)
        return Lexer.tokenize(value, index, boundFunction.next, boundFunction, Lexer.TokenType.SinglePathExpression);
}
exports.singlePathExpr = singlePathExpr;
function functionExpr(value, index, metadata) {
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
    var params = functionExprParameters(value, index, metadata);
    if (!params)
        return;
    index = params.next;
    var expr = collectionPathExpr(value, index, metadata) ||
        collectionNavigationExpr(value, index, metadata) ||
        singleNavigationExpr(value, index, metadata) ||
        complexPathExpr(value, index, metadata) ||
        singlePathExpr(value, index, metadata);
    if (expr)
        index = expr.next;
    return Lexer.tokenize(value, start, index, {
        fn: token,
        params: params,
        expression: expr
    }, Lexer.TokenType.FunctionExpression);
}
exports.functionExpr = functionExpr;
function boundFunctionExpr(value, index, metadata) { return functionExpr(value, index, metadata); }
exports.boundFunctionExpr = boundFunctionExpr;
function functionExprParameters(value, index, metadata) {
    if (!Lexer.OPEN(value[index]))
        return;
    var start = index;
    index++;
    var params = [];
    var expr = functionExprParameter(value, index, metadata);
    while (expr) {
        params.push(expr);
        if (Lexer.COMMA(expr.next)) {
            index = expr.next + 1;
            expr = functionExprParameter(value, index, metadata);
            if (!expr)
                return;
        }
        else {
            index = expr.next;
            expr = null;
        }
    }
    if (!Lexer.CLOSE(value[index]))
        return;
    index++;
    return Lexer.tokenize(value, start, index, params, Lexer.TokenType.FunctionExpressionParameters);
}
exports.functionExprParameters = functionExprParameters;
function functionExprParameter(value, index, metadata) {
    var name = parameterName(value, index);
    if (!name || !Lexer.EQ(value[name.next]))
        return;
    var start = index;
    index = name.next + 1;
    var param = parameterAlias(value, index) ||
        parameterValue(value, index, metadata);
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
    if (!Lexer.AT(value[index]))
        return;
    var id = NameOrIdentifier.odataIdentifier(value, index + 1);
    if (id)
        return Lexer.tokenize(value, index, id.next, id.value, Lexer.TokenType.ParameterAlias);
}
exports.parameterAlias = parameterAlias;
function parameterValue(value, index, metadata) {
    var token = ArrayOrObject.arrayOrObject(value, index, metadata) ||
        commonExpr(value, index, metadata);
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
function rootExpr(value, index, metadata) {
    if (!Utils.equals(value, index, '$root/'))
        return;
    var start = index;
    index += 6;
    var entitySet = NameOrIdentifier.entitySetName(value, index);
    var predicate, entity, token;
    if (entitySet)
        predicate = keyPredicate(value, entitySet.next, metadata);
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
    var nav = singleNavigationExpr(value, index, metadata);
    if (nav)
        index = nav.next;
    return Lexer.tokenize(value, start, index, {
        current: token,
        next: nav
    }, Lexer.TokenType.RootExpression);
}
exports.rootExpr = rootExpr;
