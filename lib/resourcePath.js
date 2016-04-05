"use strict";
var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
var NameOrIdentifier = require('./nameOrIdentifier');
var Expressions = require('./expressions');
function resourcePath(value, index) {
    if (value[index] == 0x2f)
        index++;
    var token = batch(value, index) ||
        entity(value, index) ||
        metadata(value, index);
    if (token)
        return token;
    token = functionImportCall(value, index) ||
        crossjoin(value, index) ||
        all(value, index) ||
        NameOrIdentifier.entitySetName(value, index) ||
        NameOrIdentifier.singletonEntity(value, index) ||
        actionImportCall(value, index);
    if (token && token.type != Lexer.TokenType.Crossjoin && token.type != Lexer.TokenType.AllResource) {
        var nav = singleNavigation(value, token.next) ||
            singlePath(value, token.next) ||
            collectionNavigation(value, token.next) ||
            collectionPath(value, token.next) ||
            complexPath(value, token.next);
        if (nav)
            return Lexer.tokenize(value, index, nav.next, { resource: token, navigation: nav }, Lexer.TokenType.ResourcePath);
    }
    return token;
}
exports.resourcePath = resourcePath;
function batch(value, index) {
    if (Utils.equals(value, index, '$batch'))
        return Lexer.tokenize(value, index, index + 6, '$batch', Lexer.TokenType.Batch);
}
exports.batch = batch;
function entity(value, index) {
    if (Utils.equals(value, index, '$entity')) {
        var start = index;
        index += 7;
        var name;
        if (value[index] == 0x2f) {
            name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1);
            if (!name)
                return;
            index = name.next;
        }
        return Lexer.tokenize(value, start, index, name || '$entity', Lexer.TokenType.Entity);
    }
}
exports.entity = entity;
function metadata(value, index) {
    if (Utils.equals(value, index, '$metadata'))
        return Lexer.tokenize(value, index, index + 9, '$metadata', Lexer.TokenType.Metadata);
}
exports.metadata = metadata;
function collectionNavigation(value, index) {
    var start = index;
    var name;
    if (value[index] == 0x2f) {
        index++;
        name = NameOrIdentifier.qualifiedEntityTypeName(value, index);
        if (!name)
            return;
        index = name.next;
    }
    var path = collectionNavigationPath(value, index);
    if (path)
        index = path.next;
    if (!name && !path)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: path }, Lexer.TokenType.CollectionNavigation);
}
exports.collectionNavigation = collectionNavigation;
function collectionNavigationPath(value, index) {
    var start = index;
    var token = collectionPath(value, index) ||
        Expressions.refExpr(value, index);
    if (token)
        return token;
    var predicate = Expressions.keyPredicate(value, index);
    if (predicate) {
        var tokenValue = predicate;
        index = predicate.next;
        var navigation = singleNavigation(value, index);
        if (navigation) {
            tokenValue = { predicate: predicate, navigation: navigation };
            index = navigation.next;
        }
        return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.CollectionNavigationPath);
    }
}
exports.collectionNavigationPath = collectionNavigationPath;
function singleNavigation(value, index) {
    var token = boundOperation(value, index) ||
        Expressions.refExpr(value, index) ||
        Expressions.valueExpr(value, index);
    if (token)
        return token;
    var start = index;
    var name;
    if (value[index] == 0x2f) {
        token = propertyPath(value, index + 1);
        if (!token)
            return;
        index = token.next;
    }
    if (value[index] == 0x2f) {
        name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1);
        if (!name)
            return;
        index = name.next;
    }
    if (!name && !token)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: token }, Lexer.TokenType.SingleNavigation);
}
exports.singleNavigation = singleNavigation;
function propertyPath(value, index) {
    var token = NameOrIdentifier.entityColNavigationProperty(value, index) ||
        NameOrIdentifier.entityNavigationProperty(value, index) ||
        NameOrIdentifier.complexColProperty(value, index) ||
        NameOrIdentifier.complexProperty(value, index) ||
        NameOrIdentifier.primitiveColProperty(value, index) ||
        NameOrIdentifier.primitiveProperty(value, index) ||
        NameOrIdentifier.streamProperty(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var navigation = boundOperation(value, index) ||
        collectionNavigation(value, index) ||
        singleNavigation(value, index) ||
        collectionPath(value, index) ||
        complexPath(value, index) ||
        singlePath(value, index);
    if (navigation)
        index = navigation.next;
    return Lexer.tokenize(value, start, index, { path: token, navigation: navigation }, Lexer.TokenType.PropertyPath);
}
exports.propertyPath = propertyPath;
function collectionPath(value, index) {
    return Expressions.countExpr(value, index) ||
        boundOperation(value, index);
}
exports.collectionPath = collectionPath;
function singlePath(value, index) {
    return Expressions.valueExpr(value, index) ||
        boundOperation(value, index);
}
exports.singlePath = singlePath;
function complexPath(value, index) {
    var token = boundOperation(value, index);
    if (token)
        return token;
    var start = index;
    var name;
    if (value[index] == 0x2f) {
        index++;
        name = NameOrIdentifier.qualifiedComplexTypeName(value, index);
        if (!name)
            return;
        index = name.next;
    }
    if (value[index] == 0x2f) {
        token = propertyPath(value, index + 1);
        if (!token)
            return;
        index = token.next;
    }
    if (!name && !token)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: token }, Lexer.TokenType.ComplexPath);
}
exports.complexPath = complexPath;
function boundOperation(value, index) {
    if (value[index] != 0x2f)
        return;
    var start = index;
    index++;
    var operation = boundEntityColFuncCall(value, index) ||
        boundEntityFuncCall(value, index) ||
        boundComplexColFuncCall(value, index) ||
        boundComplexFuncCall(value, index) ||
        boundPrimitiveColFuncCall(value, index) ||
        boundPrimitiveFuncCall(value, index) ||
        boundActionCall(value, index);
    if (!operation)
        return;
    index = operation.next;
    var name;
    if (value[index] == 0x2f) {
        name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1);
        if (!name)
            return;
        index = name.next;
    }
    var navigation = collectionNavigation(value, index) ||
        singleNavigation(value, index) ||
        complexPath(value, index) ||
        collectionPath(value, index) ||
        singlePath(value, index);
    if (navigation)
        index = navigation.next;
    return Lexer.tokenize(value, start, index, { operation: operation, name: name, navigation: navigation }, Lexer.TokenType.BoundOperation);
}
exports.boundOperation = boundOperation;
function boundActionCall(value, index) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext == index)
        return;
    var start = index;
    index = namespaceNext;
    if (value[index] != 0x2e)
        return;
    index++;
    var action = NameOrIdentifier.action(value, index);
    if (!action)
        return;
    return Lexer.tokenize(value, start, action.next, action, Lexer.TokenType.BoundActionCall);
}
exports.boundActionCall = boundActionCall;
function boundFunctionCall(value, index, odataFunction, tokenType) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext == index)
        return;
    var start = index;
    index = namespaceNext;
    if (value[index] != 0x2e)
        return;
    index++;
    var call = odataFunction(value, index);
    if (!call)
        return;
    index = call.next;
    var params = functionParameters(value, index);
    if (!params)
        return;
    index = params.next;
    return Lexer.tokenize(value, start, index, { call: call, params: params }, tokenType);
}
function boundEntityFuncCall(value, index) { return boundFunctionCall(value, index, NameOrIdentifier.entityFunction, Lexer.TokenType.BoundEntityFunctionCall); }
exports.boundEntityFuncCall = boundEntityFuncCall;
function boundEntityColFuncCall(value, index) { return boundFunctionCall(value, index, NameOrIdentifier.entityColFunction, Lexer.TokenType.BoundEntityCollectionFunctionCall); }
exports.boundEntityColFuncCall = boundEntityColFuncCall;
function boundComplexFuncCall(value, index) { return boundFunctionCall(value, index, NameOrIdentifier.complexFunction, Lexer.TokenType.BoundComplexFunctionCall); }
exports.boundComplexFuncCall = boundComplexFuncCall;
function boundComplexColFuncCall(value, index) { return boundFunctionCall(value, index, NameOrIdentifier.complexColFunction, Lexer.TokenType.BoundComplexCollectionFunctionCall); }
exports.boundComplexColFuncCall = boundComplexColFuncCall;
function boundPrimitiveFuncCall(value, index) { return boundFunctionCall(value, index, NameOrIdentifier.primitiveFunction, Lexer.TokenType.BoundPrimitiveFunctionCall); }
exports.boundPrimitiveFuncCall = boundPrimitiveFuncCall;
function boundPrimitiveColFuncCall(value, index) { return boundFunctionCall(value, index, NameOrIdentifier.primitiveColFunction, Lexer.TokenType.BoundPrimitiveCollectionFunctionCall); }
exports.boundPrimitiveColFuncCall = boundPrimitiveColFuncCall;
function actionImportCall(value, index) {
    var action = NameOrIdentifier.actionImport(value, index);
    if (action)
        return Lexer.tokenize(value, index, action.next, action, Lexer.TokenType.ActionImportCall);
}
exports.actionImportCall = actionImportCall;
function functionImportCall(value, index) {
    var fnImport = NameOrIdentifier.entityFunctionImport(value, index) ||
        NameOrIdentifier.entityColFunctionImport(value, index) ||
        NameOrIdentifier.complexFunctionImport(value, index) ||
        NameOrIdentifier.complexColFunctionImport(value, index) ||
        NameOrIdentifier.primitiveFunctionImport(value, index) ||
        NameOrIdentifier.primitiveColFunctionImport(value, index);
    if (!fnImport)
        return;
    var start = index;
    index = fnImport.next;
    var params = functionParameters(value, index);
    if (!params)
        return;
    index = params.next;
    return Lexer.tokenize(value, start, index, { import: fnImport, params: params.value }, Lexer.TokenType.FunctionImportCall);
}
exports.functionImportCall = functionImportCall;
function functionParameters(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    var params = [];
    var token = functionParameter(value, index);
    while (token) {
        params.push(token);
        index = token.next;
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            token = functionParameter(value, index);
            if (!token)
                return;
        }
        else
            break;
    }
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, params, Lexer.TokenType.FunctionParameters);
}
exports.functionParameters = functionParameters;
function functionParameter(value, index) {
    var name = Expressions.parameterName(value, index);
    if (!name)
        return;
    var start = index;
    index = name.next;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var token = Expressions.parameterAlias(value, index) ||
        PrimitiveLiteral.primitiveLiteral(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, { name: name, value: token }, Lexer.TokenType.FunctionParameter);
}
exports.functionParameter = functionParameter;
function crossjoin(value, index) {
    if (!Utils.equals(value, index, '$crossjoin'))
        return;
    var start = index;
    index += 10;
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    index = open;
    var names = [];
    var token = NameOrIdentifier.entitySetName(value, index);
    if (!token)
        return;
    while (token) {
        names.push(token);
        index = token.next;
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            token = NameOrIdentifier.entitySetName(value, index);
            if (!token)
                return;
        }
        else
            break;
    }
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    return Lexer.tokenize(value, start, index, { names: names }, Lexer.TokenType.Crossjoin);
}
exports.crossjoin = crossjoin;
function all(value, index) {
    if (Utils.equals(value, index, '$all'))
        return Lexer.tokenize(value, index, index + 4, '$all', Lexer.TokenType.AllResource);
}
exports.all = all;
//# sourceMappingURL=resourcePath.js.map