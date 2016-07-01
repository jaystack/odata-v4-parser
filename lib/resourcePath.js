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
        actionImportCall(value, index, metadataContext) ||
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
        var tokenValue = { predicate: predicate };
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
    var action = NameOrIdentifier.actionImport(value, index, metadataContext);
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
