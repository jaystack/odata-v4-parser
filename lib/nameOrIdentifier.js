"use strict";
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
function qualifiedEntityTypeName(value, index, metadataContext) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var schema;
    if (typeof metadataContext == 'object') {
        schema = getMetadataRoot(metadataContext).schemas.filter(function (it) { return it.namespace == Utils.stringify(value, start, namespaceNext); })[0];
    }
    var name = entityTypeName(value, namespaceNext + 1, schema);
    if (!name)
        return;
    return Lexer.tokenize(value, start, name.next, name, Lexer.TokenType.QualifiedEntityTypeName);
}
exports.qualifiedEntityTypeName = qualifiedEntityTypeName;
;
function qualifiedComplexTypeName(value, index, metadataContext) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var schema;
    if (typeof metadataContext == 'object') {
        schema = getMetadataRoot(metadataContext).schemas.filter(function (it) { return it.namespace == Utils.stringify(value, start, namespaceNext); })[0];
    }
    var name = complexTypeName(value, namespaceNext + 1, schema);
    if (!name)
        return;
    return Lexer.tokenize(value, start, name.next, name, Lexer.TokenType.QualifiedComplexTypeName);
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
            if (part && value[part.next] != 0x2e)
                return index - 1;
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
function entitySetName(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntitySetName);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var entitySet;
        metadataContext.dataServices.schemas.forEach(function (schema) { return schema.entityContainer.forEach(function (container) { return container.entitySets.filter(function (set) {
            var eq = set.name == token.raw;
            if (eq)
                entitySet = set;
            return eq;
        }); }); });
        if (!entitySet)
            return;
        var entityType;
        metadataContext.dataServices.schemas.forEach(function (schema) { return entitySet.entityType.indexOf(schema.namespace) == 0 && schema.entityTypes.filter(function (type) {
            var eq = type.name == entitySet.entityType.replace(schema.namespace + '.', '');
            if (eq)
                entityType = type;
            return eq;
        }); });
        if (!entityType)
            return;
        token.metadata = entityType;
    }
    return token;
}
exports.entitySetName = entitySetName;
function singletonEntity(value, index) { return odataIdentifier(value, index, Lexer.TokenType.SingletonEntity); }
exports.singletonEntity = singletonEntity;
function entityTypeName(value, index, schema) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityTypeName);
    if (!token)
        return;
    if (typeof schema == 'object') {
        var type = schema.entityTypes.filter(function (it) { return it.name == token.raw; })[0];
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityTypeName = entityTypeName;
function complexTypeName(value, index, schema) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexTypeName);
    if (!token)
        return;
    if (typeof schema == 'object') {
        var type = schema.complexTypes.filter(function (it) { return it.name == token.raw; })[0];
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
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
var primitiveTypes = [
    'Edm.Binary', 'Edm.Boolean', 'Edm.Byte', 'Edm.Date', 'Edm.DateTimeOffset', 'Edm.Decimal', 'Edm.Double', 'Edm.Duration', 'Edm.Guid',
    'Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.SByte', 'Edm.Single', 'Edm.Stream', 'Edm.String', 'Edm.TimeOfDay',
    'Edm.GeographyCollection', 'Edm.GeographyLineString', 'Edm.GeographyMultiLineString', 'Edm.GeographyMultiPoint', 'Edm.GeographyMultiPolygon', 'Edm.GeographyPoint', 'Edm.GeographyPolygon',
    'Edm.GeometryCollection', 'Edm.GeometryLineString', 'Edm.GeometryMultiLineString', 'Edm.GeometryMultiPoint', 'Edm.GeometryMultiPolygon', 'Edm.GeometryPoint', 'Edm.GeometryPolygon'
];
function isPrimitiveTypeName(type) {
    return primitiveTypes.indexOf(type) >= 0;
}
function getMetadataRoot(metadataContext) {
    var root = metadataContext;
    while (root.parent) {
        root = root.parent;
    }
    return root;
}
function primitiveProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveProperty);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var prop = metadataContext.properties[i];
            if (prop.name == token.raw) {
                if (prop.type.indexOf('Collection') == 0 || !isPrimitiveTypeName(prop.type))
                    return;
                token.metadata = prop;
                if (metadataContext.key && metadataContext.key.propertyRefs.filter(function (it) { return it.name == prop.name; }).length > 0) {
                    token.type = Lexer.TokenType.PrimitiveKeyProperty;
                }
                break;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.primitiveProperty = primitiveProperty;
function primitiveKeyProperty(value, index, metadataContext) {
    var token = primitiveProperty(value, index, metadataContext);
    if (token && token.type == Lexer.TokenType.PrimitiveKeyProperty)
        return token;
}
exports.primitiveKeyProperty = primitiveKeyProperty;
function primitiveNonKeyProperty(value, index, metadataContext) {
    var token = primitiveProperty(value, index, metadataContext);
    if (token && token.type == Lexer.TokenType.PrimitiveProperty)
        return token;
}
exports.primitiveNonKeyProperty = primitiveNonKeyProperty;
function primitiveColProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionProperty);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var prop = metadataContext.properties[i];
            if (prop.name == token.raw) {
                if (prop.type.indexOf('Collection') == -1 || !isPrimitiveTypeName(prop.type))
                    return;
                token.metadata = prop;
                if (metadataContext.key.propertyRefs.filter(function (it) { return it.name == prop.name; }).length > 0) {
                    token.type = Lexer.TokenType.PrimitiveKeyProperty;
                }
                break;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.primitiveColProperty = primitiveColProperty;
function complexProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexProperty);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var prop = metadataContext.properties[i];
            if (prop.name == token.raw) {
                if (prop.type.indexOf('Collection') == 0 || isPrimitiveTypeName(prop.type))
                    return;
                var root = getMetadataRoot(metadataContext);
                var schema = root.schemas.filter(function (it) { return prop.type.indexOf(it.namespace) == 0; })[0];
                if (!schema)
                    return;
                var complexType = schema.complexTypes.filter(function (it) { return it.name == prop.type.split('.').pop(); })[0];
                if (!complexType)
                    return;
                token.metadata = complexType;
                break;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.complexProperty = complexProperty;
function complexColProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexColProperty);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var prop = metadataContext.properties[i];
            if (prop.name == token.raw) {
                if (prop.type.indexOf('Collection') == -1 || isPrimitiveTypeName(prop.types.slice(11, -1)))
                    return;
                var root = getMetadataRoot(metadataContext);
                var schema = root.schemas.filter(function (it) { return prop.type.slice(11, -1).indexOf(it.namespace) == 0; })[0];
                if (!schema)
                    return;
                var complexType = schema.complexTypes.filter(function (it) { return it.name == prop.type.slice(11, -1).split('.').pop(); })[0];
                if (!complexType)
                    return;
                token.metadata = complexType;
                break;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.complexColProperty = complexColProperty;
function streamProperty(value, index, metadataContext) {
    return odataIdentifier(value, index, Lexer.TokenType.StreamProperty);
}
exports.streamProperty = streamProperty;
function navigationProperty(value, index, metadataContext) {
    return entityNavigationProperty(value, index) ||
        entityColNavigationProperty(value, index);
}
exports.navigationProperty = navigationProperty;
function entityNavigationProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityNavigationProperty);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        for (var i = 0; i < metadataContext.navigationProperties.length; i++) {
            var prop = metadataContext.navigationProperties[i];
            if (prop.name == token.raw && prop.type.indexOf('Collection') == -1 && !isPrimitiveTypeName(prop.type.slice(11, -1))) {
                token.metadata = prop;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.entityNavigationProperty = entityNavigationProperty;
function entityColNavigationProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityCollectionNavigationProperty);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        for (var i = 0; i < metadataContext.navigationProperties.length; i++) {
            var prop = metadataContext.navigationProperties[i];
            if (prop.name == token.raw && prop.type.indexOf('Collection') == 0 && !isPrimitiveTypeName(prop.type.slice(11, -1))) {
                token.metadata = prop;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.entityColNavigationProperty = entityColNavigationProperty;
function action(value, index) { return odataIdentifier(value, index, Lexer.TokenType.Action); }
exports.action = action;
function actionImport(value, index) { return odataIdentifier(value, index, Lexer.TokenType.ActionImport); }
exports.actionImport = actionImport;
function odataFunction(value, index) {
    return entityFunction(value, index) ||
        entityColFunction(value, index) ||
        complexFunction(value, index) ||
        complexColFunction(value, index) ||
        primitiveFunction(value, index) ||
        primitiveColFunction(value, index);
}
exports.odataFunction = odataFunction;
function entityFunction(value, index, metadataContext) { return odataIdentifier(value, index, Lexer.TokenType.EntityFunction); }
exports.entityFunction = entityFunction;
function entityColFunction(value, index, metadataContext) { return odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunction); }
exports.entityColFunction = entityColFunction;
function complexFunction(value, index, metadataContext) { return odataIdentifier(value, index, Lexer.TokenType.ComplexFunction); }
exports.complexFunction = complexFunction;
function complexColFunction(value, index, metadataContext) { return odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunction); }
exports.complexColFunction = complexColFunction;
function primitiveFunction(value, index, metadataContext) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunction); }
exports.primitiveFunction = primitiveFunction;
function primitiveColFunction(value, index, metadataContext) { return odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunction); }
exports.primitiveColFunction = primitiveColFunction;
function getFunctionImportType(metadataContext, token, isCollection, isPrimitive, types) {
    var fnImport;
    for (var i = 0; i < metadataContext.dataServices.schemas.length; i++) {
        var schema = metadataContext.dataServices.schemas[i];
        for (var j = 0; j < schema.entityContainer.length; j++) {
            var container = schema.entityContainer[j];
            for (var k = 0; k < container.functionImports.length; k++) {
                var it = container.functionImports[k];
                if (it.name == token.raw) {
                    fnImport = it;
                    break;
                }
            }
            if (fnImport)
                break;
        }
        if (fnImport)
            break;
    }
    if (!fnImport)
        return;
    var fn;
    for (var i = 0; i < metadataContext.dataServices.schemas.length; i++) {
        var schema = metadataContext.dataServices.schemas[i];
        if (fnImport.function.indexOf(schema.namespace) == 0) {
            for (var j = 0; j < schema.functions.length; j++) {
                var it = schema.functions[j];
                if (it.name == fnImport.name) {
                    fn = it;
                    break;
                }
            }
        }
        if (fn)
            break;
    }
    if (!fn)
        return;
    if (fn.returnType.type.indexOf('Collection') == isCollection ? -1 : 0)
        return;
    var elementType = isCollection ? fn.returnType.type.slice(11, -1) : fn.returnType.type;
    if (isPrimitiveTypeName(elementType) && !isPrimitive)
        return;
    if (!isPrimitiveTypeName(elementType) && isPrimitive)
        return;
    if (isPrimitive)
        return elementType;
    var type;
    for (var i = 0; i < metadataContext.dataServices.schemas.length; i++) {
        var schema = metadataContext.dataServices.schemas[i];
        if (elementType.indexOf(schema.namespace) == 0) {
            for (var j = 0; j < schema[types].length; j++) {
                var it = schema[types][j];
                if (schema.namespace + '.' + it.name == elementType) {
                    type = it;
                    break;
                }
            }
        }
        if (type)
            break;
    }
    return type;
}
function entityFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getFunctionImportType(metadataContext, token, false, false, "entityTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityFunctionImport = entityFunctionImport;
function entityColFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getFunctionImportType(metadataContext, token, true, false, "entityTypes");
        console.log('entity col function import', token, type);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityColFunctionImport = entityColFunctionImport;
function complexFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getFunctionImportType(metadataContext, token, false, false, "complexTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexFunctionImport = complexFunctionImport;
function complexColFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getFunctionImportType(metadataContext, token, true, false, "complexTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexColFunctionImport = complexColFunctionImport;
function primitiveFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getFunctionImportType(metadataContext, token, false, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveFunctionImport = primitiveFunctionImport;
function primitiveColFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunctionImport);
    console.log(token);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getFunctionImportType(metadataContext, token, true, true);
        console.log('type', type);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveColFunctionImport = primitiveColFunctionImport;
//# sourceMappingURL=nameOrIdentifier.js.map