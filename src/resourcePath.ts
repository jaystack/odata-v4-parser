import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as Expressions from './expressions';

export function resourcePath(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	if (value[index] == 0x2f) index++;
	var token = batch(value, index) ||
		entity(value, index, metadataContext) ||
		metadata(value, index);
	if (token) return token;

	var resource = NameOrIdentifier.entitySetName(value, index, metadataContext) ||
		functionImportCall(value, index, metadataContext) ||
		crossjoin(value, index) ||
		all(value, index) ||
		actionImportCall(value, index) ||
		NameOrIdentifier.singletonEntity(value, index);
		
	if (!resource) return;
	var start = index;
	index = resource.next;
	var navigation;
	
	switch (resource.type){
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
	
	if (navigation) index = navigation.next;
	if (resource) return Lexer.tokenize(value, start, index, { resource, navigation }, Lexer.TokenType.ResourcePath);
}

export function batch(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, '$batch')) return Lexer.tokenize(value, index, index + 6, '$batch', Lexer.TokenType.Batch);
}

export function entity(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	if (Utils.equals(value, index, '$entity')){
		var start = index;
		index += 7;

		var name;
		if (value[index] == 0x2f){
			name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
			if (!name) return;
			index = name.next;
		}

		return Lexer.tokenize(value, start, index, name || '$entity', Lexer.TokenType.Entity);
	}
}

export function metadata(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, '$metadata')) return Lexer.tokenize(value, index, index + 9, '$metadata', Lexer.TokenType.Metadata);
}

export function collectionNavigation(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var start = index;
	var name;
	if (value[index] == 0x2f){
		name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
		if (name) index = name.next;
	}

	var path = collectionNavigationPath(value, index, metadataContext);
	if (path) index = path.next;

	if (!name && !path) return;

	return Lexer.tokenize(value, start, index, { name, path }, Lexer.TokenType.CollectionNavigation);
}

export function collectionNavigationPath(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var start = index;
	var token = collectionPath(value, index, metadataContext) ||
		Expressions.refExpr(value, index);
	if (token) return token;

	var predicate = Expressions.keyPredicate(value, index, metadataContext);
	if (predicate){
		var tokenValue:any = predicate;
		index = predicate.next;

		var navigation = singleNavigation(value, index, metadataContext);
		if (navigation){
			tokenValue = { predicate, navigation };
			index = navigation.next;
		}

		return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.CollectionNavigationPath);
	}
}

export function singleNavigation(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = boundOperation(value, index, false, metadataContext) ||
		Expressions.refExpr(value, index) ||
		Expressions.valueExpr(value, index);
	if (token) return token;

	var start = index;
	var name;
	if (value[index] == 0x2f){
		token = propertyPath(value, index + 1, metadataContext);
		if (!token) return;
		index = token.next;
	}

	if (value[index] == 0x2f){
		name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
		if (!name) return;
		index = name.next;
	}

	if (!name && !token) return;

	return Lexer.tokenize(value, start, index, { name: name, path: token }, Lexer.TokenType.SingleNavigation);
}

export function propertyPath(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = 
		NameOrIdentifier.entityColNavigationProperty(value, index, metadataContext) ||
		NameOrIdentifier.entityNavigationProperty(value, index, metadataContext) ||
		NameOrIdentifier.complexColProperty(value, index, metadataContext) ||
		NameOrIdentifier.complexProperty(value, index, metadataContext) ||
		NameOrIdentifier.primitiveColProperty(value, index, metadataContext) ||
		NameOrIdentifier.primitiveProperty(value, index, metadataContext) ||
		NameOrIdentifier.streamProperty(value, index, metadataContext);

	if (!token) return;
	var start = index;
	index = token.next;

	var navigation;
	switch (token.type){
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
	
	if (navigation) index = navigation.next;
	
	return Lexer.tokenize(value, start, index, { path: token, navigation }, Lexer.TokenType.PropertyPath);
}

export function collectionPath(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	return Expressions.countExpr(value, index) ||
		boundOperation(value, index, true, metadataContext);
}

export function singlePath(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	return Expressions.valueExpr(value, index) ||
		boundOperation(value, index, false, metadataContext);
}

export function complexPath(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var start = index;
	var name, token;
	if (value[index] == 0x2f){
		name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1, metadataContext);
		if (name) index = name.next;
	}

	if (value[index] == 0x2f){
		token = propertyPath(value, index + 1, metadataContext);
		if (!token) return;
		index = token.next;
	}else token = boundOperation(value, index, false, metadataContext);

	if (!name && !token) return;

	return Lexer.tokenize(value, start, index, { name: name, path: token }, Lexer.TokenType.ComplexPath);
}

export function boundOperation(value:number[] | Uint8Array, index:number, isCollection:boolean, metadataContext?:any):Lexer.Token {
	if (value[index] != 0x2f) return;
	var start = index;
	index++;

	var operation = boundEntityColFuncCall(value, index, isCollection, metadataContext) ||
		boundEntityFuncCall(value, index, isCollection, metadataContext) ||
		boundComplexColFuncCall(value, index, isCollection, metadataContext) ||
		boundComplexFuncCall(value, index, isCollection, metadataContext) ||
		boundPrimitiveColFuncCall(value, index, isCollection, metadataContext) ||
		boundPrimitiveFuncCall(value, index, isCollection, metadataContext) ||
		boundActionCall(value, index, isCollection, metadataContext);
	if (!operation) return;
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
			if (value[index] == 0x2f){
				name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1, operation.metadata);
				if (name) index = name.next;
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

	if (navigation) index = navigation.next;

	return Lexer.tokenize(value, start, index, { operation, name, navigation }, Lexer.TokenType.BoundOperation);
}

export function boundActionCall(value:number[] | Uint8Array, index:number, isCollection:boolean, metadataContext?:any):Lexer.Token {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index) return;
	var start = index;
	index = namespaceNext;

	if (value[index] != 0x2e) return;
	index++;

	var action = NameOrIdentifier.action(value, index, isCollection, metadataContext);
	if (!action) return;
	action.value.namespace = Utils.stringify(value, start, namespaceNext);

	return Lexer.tokenize(value, start, action.next, action, Lexer.TokenType.BoundActionCall);
}

function boundFunctionCall(value:number[] | Uint8Array, index:number, odataFunction:Function, tokenType:Lexer.TokenType, isCollection:boolean, metadataContext?:any):Lexer.Token {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index) return;
	var start = index;
	index = namespaceNext;

	if (value[index] != 0x2e) return;
	index++;

	var call = odataFunction(value, index, isCollection, metadataContext);
	if (!call) return;
	call.value.namespace = Utils.stringify(value, start, namespaceNext);
	index = call.next;

	var params = functionParameters(value, index);
	if (!params) return;
	index = params.next;

	return Lexer.tokenize(value, start, index, { call, params }, tokenType);
}

export function boundEntityFuncCall(value:number[] | Uint8Array, index:number, isCollection:boolean, metadataContext?:any):Lexer.Token {
	return boundFunctionCall(value, index, NameOrIdentifier.entityFunction, Lexer.TokenType.BoundEntityFunctionCall, isCollection, metadataContext);
}
export function boundEntityColFuncCall(value:number[] | Uint8Array, index:number, isCollection:boolean, metadataContext?:any):Lexer.Token {
	return boundFunctionCall(value, index, NameOrIdentifier.entityColFunction, Lexer.TokenType.BoundEntityCollectionFunctionCall, isCollection, metadataContext);
}
export function boundComplexFuncCall(value:number[] | Uint8Array, index:number, isCollection:boolean, metadataContext?:any):Lexer.Token {
	return boundFunctionCall(value, index, NameOrIdentifier.complexFunction, Lexer.TokenType.BoundComplexFunctionCall, isCollection, metadataContext);
}
export function boundComplexColFuncCall(value:number[] | Uint8Array, index:number, isCollection:boolean, metadataContext?:any):Lexer.Token {
	return boundFunctionCall(value, index, NameOrIdentifier.complexColFunction, Lexer.TokenType.BoundComplexCollectionFunctionCall, isCollection, metadataContext);
}
export function boundPrimitiveFuncCall(value:number[] | Uint8Array, index:number, isCollection:boolean, metadataContext?:any):Lexer.Token {
	return boundFunctionCall(value, index, NameOrIdentifier.primitiveFunction, Lexer.TokenType.BoundPrimitiveFunctionCall, isCollection, metadataContext);
}
export function boundPrimitiveColFuncCall(value:number[] | Uint8Array, index:number, isCollection:boolean, metadataContext?:any):Lexer.Token {
	return boundFunctionCall(value, index, NameOrIdentifier.primitiveColFunction, Lexer.TokenType.BoundPrimitiveCollectionFunctionCall, isCollection, metadataContext);
}

export function actionImportCall(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var action = NameOrIdentifier.actionImport(value, index);
	if (action) return Lexer.tokenize(value, index, action.next, action, Lexer.TokenType.ActionImportCall);
}

export function functionImportCall(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var fnImport = NameOrIdentifier.entityFunctionImport(value, index, metadataContext) ||
		NameOrIdentifier.entityColFunctionImport(value, index, metadataContext) ||
		NameOrIdentifier.complexFunctionImport(value, index, metadataContext) ||
		NameOrIdentifier.complexColFunctionImport(value, index, metadataContext) ||
		NameOrIdentifier.primitiveFunctionImport(value, index, metadataContext) ||
		NameOrIdentifier.primitiveColFunctionImport(value, index, metadataContext);

	if (!fnImport) return;
	var start = index;
	index = fnImport.next;

	var params = functionParameters(value, index);
	if (!params) return;
	index = params.next;

	return Lexer.tokenize(value, start, index, { import: fnImport, params: params.value }, fnImport.type + 'Call');
}

export function functionParameters(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var open = Lexer.OPEN(value, index);
	if (!open) return;
	var start = index;
	index = open;

	var params = [];
	var token = functionParameter(value, index);
	while (token){
		params.push(token);
		index = token.next;

		var comma = Lexer.COMMA(value, index);
		if (comma){
			index = comma;
			token = functionParameter(value, index);
			if (!token) return;
		}else break;
	}

	var close = Lexer.CLOSE(value, index);
	if (!close) return;
	index = close;

	return Lexer.tokenize(value, start, index, params, Lexer.TokenType.FunctionParameters);
}

export function functionParameter(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var name = Expressions.parameterName(value, index);
	if (!name) return;
	var start = index;
	index = name.next;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	var token = Expressions.parameterAlias(value, index) ||
		PrimitiveLiteral.primitiveLiteral(value, index);

	if (!token) return;
	index = token.next;

	return Lexer.tokenize(value, start, index, { name, value: token }, Lexer.TokenType.FunctionParameter);
}

export function crossjoin(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	if (!Utils.equals(value, index, '$crossjoin')) return;
	var start = index;
	index += 10;

	var open = Lexer.OPEN(value, index);
	if (!open) return;
	index = open;

	var names = [];
	var token = NameOrIdentifier.entitySetName(value, index, metadataContext);
	if (!token) return;

	while (token){
		names.push(token);
		index = token.next;

		var comma = Lexer.COMMA(value, index);
		if (comma){
			index = comma;
			token = NameOrIdentifier.entitySetName(value, index, metadataContext);
			if (!token) return;
		}else break;
	}

	var close = Lexer.CLOSE(value, index);
	if (!close) return;

	return Lexer.tokenize(value, start, index, { names }, Lexer.TokenType.Crossjoin);
}

export function all(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, '$all')) return Lexer.tokenize(value, index, index + 4, '$all', Lexer.TokenType.AllResource);
}
