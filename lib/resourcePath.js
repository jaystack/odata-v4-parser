"use strict";
var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
var NameOrIdentifier = require('./nameOrIdentifier');
var Expressions = require('./expressions');
function resourcePath(value, index, metadataContext) {
    if (value[index] == 0x2f)
        index++;
    var token = batch(value, index) ||
        entity(value, index, metadataContext) ||
        metadata(value, index);
    if (token)
        return token;
    var resource = NameOrIdentifier.entitySetName(value, index, metadataContext) ||
        functionImportCall(value, index, metadataContext) ||
        crossjoin(value, index) ||
        all(value, index) ||
        actionImportCall(value, index) ||
        NameOrIdentifier.singletonEntity(value, index);
    if (!resource)
        return;
    var start = index;
    index = resource.next;
    var navigation;
    switch (resource.type) {
        case Lexer.TokenType.EntitySetName:
        case Lexer.TokenType.EntityFunctionImportCall:
            navigation = collectionNavigation(value, resource.next, resource.metadata);
            break;
        case Lexer.TokenType.SingletonEntity:
        case Lexer.TokenType.EntityFunctionImportCall:
            navigation = singleNavigation(value, resource.next, resource.metadata);
            break;
        case Lexer.TokenType.ComplexCollectionFunctionImportCall:
        case Lexer.TokenType.PrimitiveCollectionFunctionImportCall:
            navigation = collectionPath(value, resource.next, resource.metadata);
            break;
        case Lexer.TokenType.ComplexFunctionImportCall:
            navigation = complexPath(value, resource.next, resource.metadata);
            break;
        case Lexer.TokenType.PrimitiveFunctionImportCall:
            navigation = singlePath(value, resource.next, resource.metadata);
            break;
    }
    if (navigation)
        index = navigation.next;
    if (resource)
        return Lexer.tokenize(value, start, index, { resource: resource, navigation: navigation }, Lexer.TokenType.ResourcePath);
}
exports.resourcePath = resourcePath;
function batch(value, index) {
    if (Utils.equals(value, index, '$batch'))
        return Lexer.tokenize(value, index, index + 6, '$batch', Lexer.TokenType.Batch);
}
exports.batch = batch;
function entity(value, index, metadataContext) {
    if (Utils.equals(value, index, '$entity')) {
        var start = index;
        index += 7;
        var name;
        if (value[index] == 0x2f) {
            name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
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
function collectionNavigation(value, index, metadataContext) {
    var start = index;
    var name;
    if (value[index] == 0x2f) {
        name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
        if (name)
            index = name.next;
    }
    var path = collectionNavigationPath(value, index, metadataContext);
    if (path)
        index = path.next;
    if (!name && !path)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: path }, Lexer.TokenType.CollectionNavigation);
}
exports.collectionNavigation = collectionNavigation;
function collectionNavigationPath(value, index, metadataContext) {
    var start = index;
    var token = collectionPath(value, index, metadataContext) ||
        Expressions.refExpr(value, index);
    if (token)
        return token;
    var predicate = Expressions.keyPredicate(value, index);
    if (predicate) {
        var tokenValue = predicate;
        index = predicate.next;
        var navigation = singleNavigation(value, index, metadataContext);
        if (navigation) {
            tokenValue = { predicate: predicate, navigation: navigation };
            index = navigation.next;
        }
        return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.CollectionNavigationPath);
    }
}
exports.collectionNavigationPath = collectionNavigationPath;
function singleNavigation(value, index, metadataContext) {
    var token = boundOperation(value, index, false, metadataContext) ||
        Expressions.refExpr(value, index) ||
        Expressions.valueExpr(value, index);
    if (token)
        return token;
    var start = index;
    var name;
    if (value[index] == 0x2f) {
        token = propertyPath(value, index + 1, metadataContext);
        if (!token)
            return;
        index = token.next;
    }
    if (value[index] == 0x2f) {
        name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
        if (!name)
            return;
        index = name.next;
    }
    if (!name && !token)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: token }, Lexer.TokenType.SingleNavigation);
}
exports.singleNavigation = singleNavigation;
function propertyPath(value, index, metadataContext) {
    var token = NameOrIdentifier.entityColNavigationProperty(value, index, metadataContext) ||
        NameOrIdentifier.entityNavigationProperty(value, index, metadataContext) ||
        NameOrIdentifier.complexColProperty(value, index, metadataContext) ||
        NameOrIdentifier.complexProperty(value, index, metadataContext) ||
        NameOrIdentifier.primitiveColProperty(value, index, metadataContext) ||
        NameOrIdentifier.primitiveProperty(value, index, metadataContext) ||
        NameOrIdentifier.streamProperty(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var navigation;
    switch (token.type) {
        case Lexer.TokenType.EntityCollectionNavigationProperty:
            navigation = collectionNavigation(value, index, token.metadata);
            break;
        case Lexer.TokenType.EntityNavigationProperty:
            navigation = singleNavigation(value, index, token.metadata);
            break;
        case Lexer.TokenType.ComplexColProperty:
            navigation = collectionPath(value, index, token.metadata);
            break;
        case Lexer.TokenType.ComplexProperty:
            navigation = complexPath(value, index, token.metadata);
            break;
        case Lexer.TokenType.PrimitiveCollectionProperty:
            navigation = collectionPath(value, index, token.metadata);
            break;
        case Lexer.TokenType.PrimitiveKeyProperty:
        case Lexer.TokenType.PrimitiveProperty:
            navigation = singlePath(value, index, token.metadata);
            break;
        case Lexer.TokenType.StreamProperty:
            navigation = boundOperation(value, index, false);
            break;
    }
    if (navigation)
        index = navigation.next;
    return Lexer.tokenize(value, start, index, { path: token, navigation: navigation }, Lexer.TokenType.PropertyPath);
}
exports.propertyPath = propertyPath;
function collectionPath(value, index, metadataContext) {
    return Expressions.countExpr(value, index) ||
        boundOperation(value, index, true, metadataContext);
}
exports.collectionPath = collectionPath;
function singlePath(value, index, metadataContext) {
    return Expressions.valueExpr(value, index) ||
        boundOperation(value, index, false, metadataContext);
}
exports.singlePath = singlePath;
function complexPath(value, index, metadataContext) {
    var start = index;
    var name, token;
    if (value[index] == 0x2f) {
        name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1, metadataContext);
        if (name)
            index = name.next;
    }
    if (value[index] == 0x2f) {
        token = propertyPath(value, index + 1, metadataContext);
        if (!token)
            return;
        index = token.next;
    }
    else
        token = boundOperation(value, index, false, metadataContext);
    if (!name && !token)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: token }, Lexer.TokenType.ComplexPath);
}
exports.complexPath = complexPath;
function boundOperation(value, index, isCollection, metadataContext) {
    if (value[index] != 0x2f)
        return;
    var start = index;
    index++;
    var operation = boundEntityColFuncCall(value, index, isCollection, metadataContext) ||
        boundEntityFuncCall(value, index, isCollection, metadataContext) ||
        boundComplexColFuncCall(value, index, isCollection, metadataContext) ||
        boundComplexFuncCall(value, index, isCollection, metadataContext) ||
        boundPrimitiveColFuncCall(value, index, isCollection, metadataContext) ||
        boundPrimitiveFuncCall(value, index, isCollection, metadataContext) ||
        boundActionCall(value, index, isCollection, metadataContext);
    if (!operation)
        return;
    index = operation.next;
    var name, navigation;
    switch (operation.type) {
        case Lexer.TokenType.BoundActionCall:
            break;
        case Lexer.TokenType.BoundEntityCollectionFunctionCall:
            navigation = collectionNavigation(value, index, operation.metadata);
            break;
        case Lexer.TokenType.BoundEntityFunctionCall:
            navigation = singleNavigation(value, index, operation.metadata);
            break;
        case Lexer.TokenType.BoundComplexCollectionFunctionCall:
            if (value[index] == 0x2f) {
                name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1, operation.metadata);
                if (name)
                    index = name.next;
            }
            navigation = collectionPath(value, index, operation.metadata);
            break;
        case Lexer.TokenType.BoundComplexFunctionCall:
            navigation = complexPath(value, index, operation.metadata);
            break;
        case Lexer.TokenType.BoundPrimitiveCollectionFunctionCall:
            navigation = collectionPath(value, index, operation.metadata);
            break;
        case Lexer.TokenType.BoundPrimitiveFunctionCall:
            navigation = singlePath(value, index, operation.metadata);
            break;
    }
    if (navigation)
        index = navigation.next;
    return Lexer.tokenize(value, start, index, { operation: operation, name: name, navigation: navigation }, Lexer.TokenType.BoundOperation);
}
exports.boundOperation = boundOperation;
function boundActionCall(value, index, isCollection, metadataContext) {
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
function boundFunctionCall(value, index, odataFunction, tokenType, isCollection, metadataContext) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext == index)
        return;
    var start = index;
    index = namespaceNext;
    if (value[index] != 0x2e)
        return;
    index++;
    var call = odataFunction(value, index, isCollection, metadataContext);
    if (!call)
        return;
    index = call.next;
    var params = functionParameters(value, index);
    if (!params)
        return;
    index = params.next;
    return Lexer.tokenize(value, start, index, { call: call, params: params }, tokenType);
}
function boundEntityFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.entityFunction, Lexer.TokenType.BoundEntityFunctionCall, isCollection, metadataContext);
}
exports.boundEntityFuncCall = boundEntityFuncCall;
function boundEntityColFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.entityColFunction, Lexer.TokenType.BoundEntityCollectionFunctionCall, isCollection, metadataContext);
}
exports.boundEntityColFuncCall = boundEntityColFuncCall;
function boundComplexFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.complexFunction, Lexer.TokenType.BoundComplexFunctionCall, isCollection, metadataContext);
}
exports.boundComplexFuncCall = boundComplexFuncCall;
function boundComplexColFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.complexColFunction, Lexer.TokenType.BoundComplexCollectionFunctionCall, isCollection, metadataContext);
}
exports.boundComplexColFuncCall = boundComplexColFuncCall;
function boundPrimitiveFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.primitiveFunction, Lexer.TokenType.BoundPrimitiveFunctionCall, isCollection, metadataContext);
}
exports.boundPrimitiveFuncCall = boundPrimitiveFuncCall;
function boundPrimitiveColFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.primitiveColFunction, Lexer.TokenType.BoundPrimitiveCollectionFunctionCall, isCollection, metadataContext);
}
exports.boundPrimitiveColFuncCall = boundPrimitiveColFuncCall;
function actionImportCall(value, index, metadataContext) {
    var action = NameOrIdentifier.actionImport(value, index);
    if (action)
        return Lexer.tokenize(value, index, action.next, action, Lexer.TokenType.ActionImportCall);
}
exports.actionImportCall = actionImportCall;
function functionImportCall(value, index, metadataContext) {
    var fnImport = NameOrIdentifier.entityFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.entityColFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.complexFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.complexColFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.primitiveFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.primitiveColFunctionImport(value, index, metadataContext);
    if (!fnImport)
        return;
    var start = index;
    index = fnImport.next;
    var params = functionParameters(value, index);
    if (!params)
        return;
    index = params.next;
    return Lexer.tokenize(value, start, index, { import: fnImport, params: params.value }, fnImport.type + 'Call');
}
exports.functionImportCall = functionImportCall;
function functionParameters(value, index, metadataContext) {
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
function functionParameter(value, index, metadataContext) {
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
function crossjoin(value, index, metadataContext) {
    if (!Utils.equals(value, index, '$crossjoin'))
        return;
    var start = index;
    index += 10;
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    index = open;
    var names = [];
    var token = NameOrIdentifier.entitySetName(value, index, metadataContext);
    if (!token)
        return;
    while (token) {
        names.push(token);
        index = token.next;
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            token = NameOrIdentifier.entitySetName(value, index, metadataContext);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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
