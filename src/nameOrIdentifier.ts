import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';

export function enumeration(value:number[] | Uint8Array, index:number):Lexer.Token {
	var type = qualifiedEnumTypeName(value, index);
	if (!type) return;
	var start = index;
	index = type.next;

	var squote = Lexer.SQUOTE(value, index);
	if (!squote) return;
	index = squote;

	var enumVal = enumValue(value, index);
	if (!enumVal) return;
	index = enumVal.next;

	squote = Lexer.SQUOTE(value, index);
	if (!squote) return;
	index = squote;

	return Lexer.tokenize(value, start, index, {
		name: type,
		value: enumVal
	}, Lexer.TokenType.Enum);
}
export function enumValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var val = singleEnumValue(value, index);
	if (!val) return;
	var start = index;

	var arr = [];
	while (val){
		arr.push(val);
		index = val.next;
		var comma = Lexer.COMMA(value, val.next);
		if (comma){
			index = comma;
			val = singleEnumValue(value, index);
		}else break;
	}

	return Lexer.tokenize(value, start, index, { values: arr }, Lexer.TokenType.EnumValue);
}
export function singleEnumValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	return enumerationMember(value, index) ||
		enumMemberValue(value, index);
}
export function enumMemberValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var token = PrimitiveLiteral.int64Value(value, index);
	if (token){
		token.type = Lexer.TokenType.EnumMemberValue;
		return token;
	}
}
export function singleQualifiedTypeName(value:number[] | Uint8Array, index:number):Lexer.Token {
	return qualifiedEntityTypeName(value, index) ||
		qualifiedComplexTypeName(value, index) ||
		qualifiedTypeDefinitionName(value, index) ||
		qualifiedEnumTypeName(value, index) ||
		primitiveTypeName(value, index);
}
export function qualifiedTypeName(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, 'Collection')) {
		var start = index;
		index += 10;

		var squote = Lexer.SQUOTE(value, index);
		if (!squote) return;
		index = squote;

		var token = singleQualifiedTypeName(value, index);
		if (!token) return;
		else index = token.next;

		squote = Lexer.SQUOTE(value, index);
		if (!squote) return;
		index = squote;

		token.position = start;
		token.next = index;
		token.raw = Utils.stringify(value, token.position, token.next);
		token.type = Lexer.TokenType.Collection;
	} else return singleQualifiedTypeName(value, index);
};
export function qualifiedEntityTypeName(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var start = index;
	var namespaceNext = namespace(value, index);

	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var schema;
	if (typeof metadataContext == 'object'){
		schema = getMetadataRoot(metadataContext).schemas.filter(it => it.namespace == Utils.stringify(value, start, namespaceNext))[0];
	}
	var name = entityTypeName(value, namespaceNext + 1, schema);
	if (!name) return;

	return Lexer.tokenize(value, start, name.next, name, Lexer.TokenType.QualifiedEntityTypeName);
};
export function qualifiedComplexTypeName(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var start = index;
	var namespaceNext = namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var schema;
	if (typeof metadataContext == 'object'){
		schema = getMetadataRoot(metadataContext).schemas.filter(it => it.namespace == Utils.stringify(value, start, namespaceNext))[0];
	}
	var name = complexTypeName(value, namespaceNext + 1, schema);
	if (!name) return;

	return Lexer.tokenize(value, start, name.next, name, Lexer.TokenType.QualifiedComplexTypeName);
};
export function qualifiedTypeDefinitionName(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	var namespaceNext = namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var nameNext = typeDefinitionName(value, namespaceNext + 1);
	if (nameNext && nameNext.next == namespaceNext + 1) return;

	return Lexer.tokenize(value, start, nameNext.next, 'TypeDefinitionName', Lexer.TokenType.Identifier);
};
export function qualifiedEnumTypeName(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	var namespaceNext = namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var nameNext = enumerationTypeName(value, namespaceNext + 1);
	if (nameNext && nameNext.next == namespaceNext + 1) return;

	return Lexer.tokenize(value, start, nameNext.next, 'EnumTypeName', Lexer.TokenType.Identifier);
};
export function namespace(value:number[] | Uint8Array, index:number):number {
	var part = namespacePart(value, index);
	while (part && part.next > index) {
		index = part.next;
		if (value[part.next] == 0x2e) {
			index++;
			part = namespacePart(value, index);
			if (part && value[part.next] != 0x2e) return index - 1;
		}
	}

	return index - 1;
};
export function odataIdentifier(value:number[] | Uint8Array, index:number, tokenType?:Lexer.TokenType):Lexer.Token {
	var start = index;
	if (Lexer.identifierLeadingCharacter(value[index])) {
		index++;
		while (index < value.length && (index - start < 128) && Lexer.identifierCharacter(value[index])) {
			index++;
		}
	}

	if (index > start) return Lexer.tokenize(value, start, index, { name: Utils.stringify(value, start, index) }, tokenType || Lexer.TokenType.ODataIdentifier);
}
export function namespacePart(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.NamespacePart); }
export function entitySetName(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.EntitySetName);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		var entitySet;
		metadataContext.dataServices.schemas.forEach(schema => schema.entityContainer.forEach(container => container.entitySets.filter((set) => {
			var eq = set.name == token.raw;
			if (eq) entitySet = set;
			return eq;
		})));
		if (!entitySet) return;
		
		var entityType;
		metadataContext.dataServices.schemas.forEach(schema => entitySet.entityType.indexOf(schema.namespace) == 0 && schema.entityTypes.filter((type) => {
			var eq = type.name == entitySet.entityType.replace(schema.namespace + '.', '');
			if (eq) entityType = type;
			return eq;
		}));
		if (!entityType) return;
		
		token.metadata = entityType;
	}
	
	return token;
}
export function singletonEntity(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.SingletonEntity); }
export function entityTypeName(value:number[] | Uint8Array, index:number, schema?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.EntityTypeName);
	if (!token) return;
	
	if (typeof schema == 'object'){
		var type = schema.entityTypes.filter(it => it.name == token.raw)[0];
		if (!type) return;
		token.metadata = type;
	}
	
	return token;
}
export function complexTypeName(value:number[] | Uint8Array, index:number, schema?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.ComplexTypeName);
	if (!token) return;
	
	if (typeof schema == 'object'){
		var type = schema.complexTypes.filter(it => it.name == token.raw)[0];
		if (!type) return;
		token.metadata = type;
	}
	
	return token;
}
export function typeDefinitionName(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.TypeDefinitionName); }
export function enumerationTypeName(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EnumerationTypeName); }
export function enumerationMember(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EnumerationMember); }
export function termName(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.TermName); }
export function primitiveTypeName(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'Edm.')) return;
	var start = index;
	index += 4;
	var end = index + (Utils.equals(value, index, 'Binary') ||
		Utils.equals(value, index, 'Boolean') ||
		Utils.equals(value, index, 'Byte') ||
		Utils.equals(value, index, 'Date') ||
		Utils.equals(value, index, 'DateTimeOffset') ||
		Utils.equals(value, index, 'Decimal') ||
		Utils.equals(value, index, 'Double') ||
		Utils.equals(value, index, 'Duration') ||
		Utils.equals(value, index, 'Guid') ||
		Utils.equals(value, index, 'Int16') ||
		Utils.equals(value, index, 'Int32') ||
		Utils.equals(value, index, 'Int64') ||
		Utils.equals(value, index, 'SByte') ||
		Utils.equals(value, index, 'Single') ||
		Utils.equals(value, index, 'Stream') ||
		Utils.equals(value, index, 'String') ||
		Utils.equals(value, index, 'TimeOfDay') ||
		Utils.equals(value, index, 'GeographyCollection') ||
		Utils.equals(value, index, 'GeographyLineString') ||
		Utils.equals(value, index, 'GeographyMultiLineString') ||
		Utils.equals(value, index, 'GeographyMultiPoint') ||
		Utils.equals(value, index, 'GeographyMultiPolygon') ||
		Utils.equals(value, index, 'GeographyPoint') ||
		Utils.equals(value, index, 'GeographyPolygon') ||
		Utils.equals(value, index, 'GeometryCollection') ||
		Utils.equals(value, index, 'GeometryLineString') ||
		Utils.equals(value, index, 'GeometryMultiLineString') ||
		Utils.equals(value, index, 'GeometryMultiPoint') ||
		Utils.equals(value, index, 'GeometryMultiPolygon') ||
		Utils.equals(value, index, 'GeometryPoint') ||
		Utils.equals(value, index, 'GeometryPolygon')
		);

	if (end > index) return Lexer.tokenize(value, start, end, 'PrimitiveTypeName', Lexer.TokenType.Identifier);
};
const primitiveTypes:string[] = [
	'Edm.Binary', 'Edm.Boolean', 'Edm.Byte', 'Edm.Date', 'Edm.DateTimeOffset', 'Edm.Decimal', 'Edm.Double', 'Edm.Duration', 'Edm.Guid',
	'Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.SByte', 'Edm.Single', 'Edm.Stream', 'Edm.String', 'Edm.TimeOfDay',
	'Edm.GeographyCollection', 'Edm.GeographyLineString', 'Edm.GeographyMultiLineString', 'Edm.GeographyMultiPoint', 'Edm.GeographyMultiPolygon', 'Edm.GeographyPoint', 'Edm.GeographyPolygon',
	'Edm.GeometryCollection', 'Edm.GeometryLineString', 'Edm.GeometryMultiLineString', 'Edm.GeometryMultiPoint', 'Edm.GeometryMultiPolygon', 'Edm.GeometryPoint', 'Edm.GeometryPolygon'
];
function isPrimitiveTypeName(type:string):boolean {
	return primitiveTypes.indexOf(type) >= 0;
}
function getMetadataRoot(metadataContext:any){
	var root = metadataContext;
	while (root.parent){
		root = root.parent;
	}
	return root;
}
export function primitiveProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveProperty);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		for (var i = 0; i < metadataContext.properties.length; i++){
			var prop = metadataContext.properties[i];
			if (prop.name == token.raw){
				if (prop.type.indexOf('Collection') == 0 || !isPrimitiveTypeName(prop.type)) return;
				token.metadata = prop;
				
				if (metadataContext.key && metadataContext.key.propertyRefs.filter(it => it.name == prop.name).length > 0){
					token.type = Lexer.TokenType.PrimitiveKeyProperty;
				}
				
				break;
			}
		}
		
		if (!token.metadata) return;
	}
	
	return token;
}
export function primitiveKeyProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = primitiveProperty(value, index, metadataContext);
	if (token && token.type == Lexer.TokenType.PrimitiveKeyProperty) return token;
}
export function primitiveNonKeyProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = primitiveProperty(value, index, metadataContext);
	if (token && token.type == Lexer.TokenType.PrimitiveProperty) return token;
}
export function primitiveColProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionProperty);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		for (var i = 0; i < metadataContext.properties.length; i++){
			var prop = metadataContext.properties[i];
			if (prop.name == token.raw){
				if (prop.type.indexOf('Collection') == -1 || !isPrimitiveTypeName(prop.type)) return;
				token.metadata = prop;
				
				if (metadataContext.key.propertyRefs.filter(it => it.name == prop.name).length > 0){
					token.type = Lexer.TokenType.PrimitiveKeyProperty;
				}
				
				break;
			}
		}
		
		if (!token.metadata) return;
	}
	
	return token;
}
export function complexProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.ComplexProperty);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		for (var i = 0; i < metadataContext.properties.length; i++){
			var prop = metadataContext.properties[i];
			if (prop.name == token.raw){
				if (prop.type.indexOf('Collection') == 0 || isPrimitiveTypeName(prop.type)) return;
				var root = getMetadataRoot(metadataContext);
				var schema = root.schemas.filter(it => prop.type.indexOf(it.namespace) == 0)[0];
				if (!schema) return;
				
				var complexType = schema.complexTypes.filter(it => it.name == prop.type.split('.').pop())[0];
				if (!complexType) return;
				
				token.metadata = complexType;
				break;
			}
		}
		
		if (!token.metadata) return;
	}
	
	return token;
}
export function complexColProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.ComplexColProperty);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		for (var i = 0; i < metadataContext.properties.length; i++){
			var prop = metadataContext.properties[i];
			if (prop.name == token.raw){
				if (prop.type.indexOf('Collection') == -1 || isPrimitiveTypeName(prop.types.slice(11, -1))) return;
				var root = getMetadataRoot(metadataContext);
				var schema = root.schemas.filter(it => prop.type.slice(11, -1).indexOf(it.namespace) == 0)[0];
				if (!schema) return;
				
				var complexType = schema.complexTypes.filter(it => it.name == prop.type.slice(11, -1).split('.').pop())[0];
				if (!complexType) return;
				
				token.metadata = complexType;
				break;
			}
		}
		
		if (!token.metadata) return;
	}
	
	return token;
}
export function streamProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	return odataIdentifier(value, index, Lexer.TokenType.StreamProperty);
}

export function navigationProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	return entityNavigationProperty(value, index) ||
		entityColNavigationProperty(value, index);
}
export function entityNavigationProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.EntityNavigationProperty);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		for (var i = 0; i < metadataContext.navigationProperties.length; i++){
			var prop = metadataContext.navigationProperties[i];
			if (prop.name == token.raw && prop.type.indexOf('Collection') == -1 && !isPrimitiveTypeName(prop.type.slice(11, -1))){
				token.metadata = prop;
			}
		}
		if (!token.metadata) return;
	}
	
	return token;
}
export function entityColNavigationProperty(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.EntityCollectionNavigationProperty);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		for (var i = 0; i < metadataContext.navigationProperties.length; i++){
			var prop = metadataContext.navigationProperties[i];
			if (prop.name == token.raw && prop.type.indexOf('Collection') == 0 && !isPrimitiveTypeName(prop.type.slice(11, -1))){
				token.metadata = prop;
			}
		}
		if (!token.metadata) return;
	}
	
	return token;
}

export function action(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.Action); }
export function actionImport(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ActionImport); }

export function odataFunction(value:number[] | Uint8Array, index:number):Lexer.Token {
	return entityFunction(value, index) ||
		entityColFunction(value, index) ||
		complexFunction(value, index) ||
		complexColFunction(value, index) ||
		primitiveFunction(value, index) ||
		primitiveColFunction(value, index);
}

export function entityFunction(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityFunction); }
export function entityColFunction(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunction); }
export function complexFunction(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexFunction); }
export function complexColFunction(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunction); }
export function primitiveFunction(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunction); }
export function primitiveColFunction(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunction); }

function getFunctionImportType(metadataContext:any, token:Lexer.Token, isCollection:boolean, isPrimitive:boolean, types?:string){
	var fnImport;
		
	for (var i = 0; i < metadataContext.dataServices.schemas.length; i++){
		var schema = metadataContext.dataServices.schemas[i];
		for (var j = 0; j < schema.entityContainer.length; j++){
			var container = schema.entityContainer[j];
			for (var k = 0; k < container.functionImports.length; k++){
				var it = container.functionImports[k];
				if (it.name == token.raw){
					fnImport = it;
					break;
				}
			}
			if (fnImport) break;
		}
		if (fnImport) break;
	}
	if (!fnImport) return;
	
	var fn;
	for (var i = 0; i < metadataContext.dataServices.schemas.length; i++){
		var schema = metadataContext.dataServices.schemas[i];
		if (fnImport.function.indexOf(schema.namespace) == 0){
			for (var j = 0; j < schema.functions.length; j++){
				var it = schema.functions[j];
				if (it.name == fnImport.name){
					fn = it;
					break;
				}
			}
		}
		if (fn) break;
	}
	if (!fn) return;
	if (fn.returnType.type.indexOf('Collection') == isCollection ? -1 : 0) return;
	var elementType = isCollection ? fn.returnType.type.slice(11, -1) : fn.returnType.type;
	if (isPrimitiveTypeName(elementType) && !isPrimitive) return;
	if (!isPrimitiveTypeName(elementType) && isPrimitive) return;
	if (isPrimitive) return elementType;
	
	var type;
	for (var i = 0; i < metadataContext.dataServices.schemas.length; i++){
		var schema = metadataContext.dataServices.schemas[i];
		if (elementType.indexOf(schema.namespace) == 0){
			for (var j = 0; j < schema[types].length; j++){
				var it = schema[types][j];
				if (schema.namespace + '.' + it.name == elementType){
					type = it;
					break;
				}
			}
		}
		if (type) break;
	}
	
	return type;
}
export function entityFunctionImport(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.EntityFunctionImport);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		var type = getFunctionImportType(metadataContext, token, false, false, "entityTypes");
		if (!type) return;
		token.metadata = type;
	}
	
	return token;
}
export function entityColFunctionImport(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunctionImport);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		var type = getFunctionImportType(metadataContext, token, true, false, "entityTypes");
		console.log('entity col function import', token, type);
		if (!type) return;
		token.metadata = type;
	}
	
	return token;
}
export function complexFunctionImport(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.ComplexFunctionImport);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		var type = getFunctionImportType(metadataContext, token, false, false, "complexTypes");
		if (!type) return;
		token.metadata = type;
	}
	
	return token;
}
export function complexColFunctionImport(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunctionImport);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		var type = getFunctionImportType(metadataContext, token, true, false, "complexTypes");
		if (!type) return;
		token.metadata = type;
	}
	
	return token;
}
export function primitiveFunctionImport(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunctionImport);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		var type = getFunctionImportType(metadataContext, token, false, true);
		if (!type) return;
		token.metadata = type;
	}
	
	return token;
}
export function primitiveColFunctionImport(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunctionImport);
	console.log(token);
	if (!token) return;
	
	if (typeof metadataContext == 'object'){
		var type = getFunctionImportType(metadataContext, token, true, true);
		console.log('type', type);
		if (!type) return;
		token.metadata = type;
	}
	
	return token;
}
