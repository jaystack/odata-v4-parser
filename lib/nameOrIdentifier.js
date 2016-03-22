var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
function enumeration(value, index) {
    var type = qualifiedEnumTypeName(value, index);
    if (!type)
        return;
    var start = index;
    index = type.next;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var enumVal = enumValue(value, index);
    if (!enumVal)
        return;
    index = enumVal.next;
    squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    return Lexer.tokenize(value, start, index, {
        name: type,
        value: enumVal
    }, Lexer.TokenType.Enum);
}
exports.enumeration = enumeration;
function enumValue(value, index) {
    var val = singleEnumValue(value, index);
    if (!val)
        return;
    var start = index;
    var arr = [];
    while (val) {
        arr.push(val);
        index = val.next;
        var comma = Lexer.COMMA(value, val.next);
        if (comma) {
            index = comma;
            val = singleEnumValue(value, index);
        }
        else
            break;
    }
    return Lexer.tokenize(value, start, index, { values: arr }, Lexer.TokenType.EnumValue);
}
exports.enumValue = enumValue;
function singleEnumValue(value, index) {
    return enumerationMember(value, index) ||
        enumMemberValue(value, index);
}
exports.singleEnumValue = singleEnumValue;
function enumMemberValue(value, index) {
    var token = PrimitiveLiteral.int64Value(value, index);
    if (token) {
        token.type = Lexer.TokenType.EnumMemberValue;
        return token;
    }
}
exports.enumMemberValue = enumMemberValue;
function singleQualifiedTypeName(value, index) {
    return qualifiedEntityTypeName(value, index) ||
        qualifiedComplexTypeName(value, index) ||
        qualifiedTypeDefinitionName(value, index) ||
        qualifiedEnumTypeName(value, index) ||
        primitiveTypeName(value, index);
}
exports.singleQualifiedTypeName = singleQualifiedTypeName;
function qualifiedTypeName(value, index) {
    if (Utils.equals(value, index, 'Collection')) {
        var start = index;
        index += 10;
        var squote = Lexer.SQUOTE(value, index);
        if (!squote)
            return;
        index = squote;
        var token = singleQualifiedTypeName(value, index);
        if (!token)
            return;
        else
            index = token.next;
        squote = Lexer.SQUOTE(value, index);
        if (!squote)
            return;
        index = squote;
        token.position = start;
        token.next = index;
        token.raw = Utils.stringify(value, token.position, token.next);
        token.type = Lexer.TokenType.Collection;
    }
    else
        return singleQualifiedTypeName(value, index);
}
exports.qualifiedTypeName = qualifiedTypeName;
;
function qualifiedEntityTypeName(value, index) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var nameNext = entityTypeName(value, namespaceNext + 1);
    if (nameNext && nameNext.next == namespaceNext + 1)
        return;
    return Lexer.tokenize(value, start, nameNext.next, 'EntityTypeName', Lexer.TokenType.Identifier);
}
exports.qualifiedEntityTypeName = qualifiedEntityTypeName;
;
function qualifiedComplexTypeName(value, index) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var nameNext = complexTypeName(value, namespaceNext + 1);
    if (nameNext && nameNext.next == namespaceNext + 1)
        return;
    return Lexer.tokenize(value, start, nameNext.next, 'ComplexTypeName', Lexer.TokenType.Identifier);
}
exports.qualifiedComplexTypeName = qualifiedComplexTypeName;
;
function qualifiedTypeDefinitionName(value, index) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var nameNext = typeDefinitionName(value, namespaceNext + 1);
    if (nameNext && nameNext.next == namespaceNext + 1)
        return;
    return Lexer.tokenize(value, start, nameNext.next, 'TypeDefinitionName', Lexer.TokenType.Identifier);
}
exports.qualifiedTypeDefinitionName = qualifiedTypeDefinitionName;
;
function qualifiedEnumTypeName(value, index) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var nameNext = enumerationTypeName(value, namespaceNext + 1);
    if (nameNext && nameNext.next == namespaceNext + 1)
        return;
    return Lexer.tokenize(value, start, nameNext.next, 'EnumTypeName', Lexer.TokenType.Identifier);
}
exports.qualifiedEnumTypeName = qualifiedEnumTypeName;
;
function namespace(value, index) {
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
}
exports.namespace = namespace;
;
function odataIdentifier(value, index, tokenType) {
    var start = index;
    if (Lexer.identifierLeadingCharacter(value[index])) {
        index++;
        while (index < value.length && (index - start < 128) && Lexer.identifierCharacter(value[index])) {
            index++;
        }
    }
    if (index > start)
        return Lexer.tokenize(value, start, index, { name: Utils.stringify(value, start, index) }, tokenType || Lexer.TokenType.ODataIdentifier);
}
exports.odataIdentifier = odataIdentifier;
function namespacePart(value, index) { return odataIdentifier(value, index, Lexer.TokenType.NamespacePart); }
exports.namespacePart = namespacePart;
function entitySetName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntitySetName); }
exports.entitySetName = entitySetName;
function singletonEntity(value, index) { return odataIdentifier(value, index, Lexer.TokenType.SingletonEntity); }
exports.singletonEntity = singletonEntity;
function entityTypeName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntityTypeName); }
exports.entityTypeName = entityTypeName;
function complexTypeName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ComplexTypeName); }
exports.complexTypeName = complexTypeName;
function typeDefinitionName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.TypeDefinitionName); }
exports.typeDefinitionName = typeDefinitionName;
function enumerationTypeName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EnumerationTypeName); }
exports.enumerationTypeName = enumerationTypeName;
function enumerationMember(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EnumerationMember); }
exports.enumerationMember = enumerationMember;
function termName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.TermName); }
exports.termName = termName;
function primitiveTypeName(value, index) {
    if (!Utils.equals(value, index, 'Edm.'))
        return;
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
        Utils.equals(value, index, 'GeometryPolygon'));
    if (end > index)
        return Lexer.tokenize(value, start, end, 'PrimitiveTypeName', Lexer.TokenType.Identifier);
}
exports.primitiveTypeName = primitiveTypeName;
;
function primitiveProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveProperty); }
exports.primitiveProperty = primitiveProperty;
function primitiveKeyProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveKeyProperty); }
exports.primitiveKeyProperty = primitiveKeyProperty;
function primitiveNonKeyProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveNonKeyProperty); }
exports.primitiveNonKeyProperty = primitiveNonKeyProperty;
function primitiveColProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionProperty); }
exports.primitiveColProperty = primitiveColProperty;
function complexProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ComplexProperty); }
exports.complexProperty = complexProperty;
function complexColProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ComplexColProperty); }
exports.complexColProperty = complexColProperty;
function streamProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.StreamProperty); }
exports.streamProperty = streamProperty;
function navigationProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.NavigationProperty); }
exports.navigationProperty = navigationProperty;
function entityNavigationProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntityNavigationProperty); }
exports.entityNavigationProperty = entityNavigationProperty;
function entityColNavigationProperty(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntityCollectionNavigationProperty); }
exports.entityColNavigationProperty = entityColNavigationProperty;
function action(value, index) { return odataIdentifier(value, index, Lexer.TokenType.Action); }
exports.action = action;
function actionImport(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ActionImport); }
exports.actionImport = actionImport;
function odataFunction(value, index) { return odataIdentifier(value, index, Lexer.TokenType.Function); }
exports.odataFunction = odataFunction;
function entityFunction(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntityFunction); }
exports.entityFunction = entityFunction;
function entityColFunction(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunction); }
exports.entityColFunction = entityColFunction;
function complexFunction(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ComplexFunction); }
exports.complexFunction = complexFunction;
function complexColFunction(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunction); }
exports.complexColFunction = complexColFunction;
function primitiveFunction(value, index) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunction); }
exports.primitiveFunction = primitiveFunction;
function primitiveColFunction(value, index) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunction); }
exports.primitiveColFunction = primitiveColFunction;
function entityFunctionImport(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntityFunctionImport); }
exports.entityFunctionImport = entityFunctionImport;
function entityColFunctionImport(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunctionImport); }
exports.entityColFunctionImport = entityColFunctionImport;
function complexFunctionImport(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ComplexFunctionImport); }
exports.complexFunctionImport = complexFunctionImport;
function complexColFunctionImport(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunctionImport); }
exports.complexColFunctionImport = complexColFunctionImport;
function primitiveFunctionImport(value, index) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunctionImport); }
exports.primitiveFunctionImport = primitiveFunctionImport;
function primitiveColFunctionImport(value, index) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunctionImport); }
exports.primitiveColFunctionImport = primitiveColFunctionImport;
