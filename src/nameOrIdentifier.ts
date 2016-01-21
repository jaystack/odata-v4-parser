import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';

export function enumeration(value:number[] | Uint8Array, index:number):Lexer.Token {
	var type = qualifiedEnumTypeName(value, index);
	if (!type) return;
	var start = index;
	index = type.next;

	if (!Lexer.SQUOTE(value[index])) return;
	index++;

	var enumVal = enumValue(value, index);
	if (!enumVal) return;
	index = enumVal.next;

	if (!Lexer.SQUOTE(value[index])) return;
	index++;

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
		if (Lexer.COMMA(value[val.next])){
			index++;
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
		if (!Lexer.SQUOTE(value[index])) return;
		index++;

		var token = singleQualifiedTypeName(value, index);
		if (!token) return;
		else index = token.next;

		if (!Lexer.SQUOTE(value[index])) return;
		index++;
		token.position = start;
		token.next = index;
		token.raw = Utils.stringify(value, token.position, token.next);
		token.type = Lexer.TokenType.Collection;
	} else return singleQualifiedTypeName(value, index);
};
export function qualifiedEntityTypeName(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	var namespaceNext = namespace(value, index);

	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var nameNext = entityTypeName(value, namespaceNext + 1);
	if (nameNext && nameNext.next == namespaceNext + 1) return;

	return Lexer.tokenize(value, start, nameNext.next, 'EntityTypeName', Lexer.TokenType.Identifier);
};
export function qualifiedComplexTypeName(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	var namespaceNext = namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var nameNext = complexTypeName(value, namespaceNext + 1);
	if (nameNext && nameNext.next == namespaceNext + 1) return;

	return Lexer.tokenize(value, start, nameNext.next, 'ComplexTypeName', Lexer.TokenType.Identifier);
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
			if (part && value[part.next] != 0x2e) {
				//part.next = index - 1;
				return index - 1;
			}
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
export function entitySetName(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntitySetName); }
export function singletonEntity(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.SingletonEntity); }
export function entityTypeName(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityTypeName); }
export function complexTypeName(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexTypeName); }
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
export function primitiveProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveProperty); }
export function primitiveKeyProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveKeyProperty); }
export function primitiveNonKeyProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveNonKeyProperty); }
export function primitiveColProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionProperty); }
export function complexProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexProperty); }
export function complexColProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexColProperty); }
export function streamProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.StreamProperty); }

export function navigationProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.NavigationProperty); }
export function entityNavigationProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityNavigationProperty); }
export function entityColNavigationProperty(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityCollectionNavigationProperty); }

export function action(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.Action); }
export function actionImport(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ActionImport); }

export function odataFunction(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.Function); }

export function entityFunction(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityFunction); }
export function entityColFunction(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunction); }
export function complexFunction(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexFunction); }
export function complexColFunction(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunction); }
export function primitiveFunction(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunction); }
export function primitiveColFunction(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunction); }

export function entityFunctionImport(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityFunctionImport); }
export function entityColFunctionImport(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunctionImport); }
export function complexFunctionImport(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexFunctionImport); }
export function complexColFunctionImport(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunctionImport); }
export function primitiveFunctionImport(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunctionImport); }
export function primitiveColFunctionImport(value:number[] | Uint8Array, index:number):Lexer.Token { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunctionImport); }
