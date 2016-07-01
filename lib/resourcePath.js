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
            delete resource.metadata;
            break;
        case Lexer.TokenType.SingletonEntity:
        case Lexer.TokenType.EntityFunctionImportCall:
            navigation = singleNavigation(value, resource.next, resource.metadata);
            delete resource.metadata;
            break;
        case Lexer.TokenType.ComplexCollectionFunctionImportCall:
        case Lexer.TokenType.PrimitiveCollectionFunctionImportCall:
            navigation = collectionPath(value, resource.next, resource.metadata);
            delete resource.metadata;
            break;
        case Lexer.TokenType.ComplexFunctionImportCall:
            navigation = complexPath(value, resource.next, resource.metadata);
            delete resource.metadata;
            break;
        case Lexer.TokenType.PrimitiveFunctionImportCall:
            navigation = singlePath(value, resource.next, resource.metadata);
            delete resource.metadata;
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
    var predicate = Expressions.keyPredicate(value, index, metadataContext);
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
        NameOrIdentifier.streamProperty(value, index, metadataContext);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var navigation;
    switch (token.type) {
        case Lexer.TokenType.EntityCollectionNavigationProperty:
            navigation = collectionNavigation(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.EntityNavigationProperty:
            navigation = singleNavigation(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.ComplexColProperty:
            navigation = collectionPath(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.ComplexProperty:
            navigation = complexPath(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.PrimitiveCollectionProperty:
            navigation = collectionPath(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.PrimitiveKeyProperty:
        case Lexer.TokenType.PrimitiveProperty:
            navigation = singlePath(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.StreamProperty:
            navigation = boundOperation(value, index, token.metadata);
            delete token.metadata;
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
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundEntityFunctionCall:
            navigation = singleNavigation(value, index, operation.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundComplexCollectionFunctionCall:
            if (value[index] == 0x2f) {
                name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1, operation.metadata);
                if (name)
                    index = name.next;
            }
            navigation = collectionPath(value, index, operation.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundComplexFunctionCall:
            navigation = complexPath(value, index, operation.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundPrimitiveCollectionFunctionCall:
            navigation = collectionPath(value, index, operation.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundPrimitiveFunctionCall:
            navigation = singlePath(value, index, operation.metadata);
            delete operation.metadata;
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
    var action = NameOrIdentifier.action(value, index, isCollection, metadataContext);
    if (!action)
        return;
    action.value.namespace = Utils.stringify(value, start, namespaceNext);
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
    call.value.namespace = Utils.stringify(value, start, namespaceNext);
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
