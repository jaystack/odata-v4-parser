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
                if (prop.type.indexOf('Collection') == -1 || isPrimitiveTypeName(prop.type.slice(11, -1)))
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
    var token = odataIdentifier(value, index, Lexer.TokenType.StreamProperty);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var prop = metadataContext.properties[i];
            if (prop.name == token.raw) {
                if (prop.type != 'Edm.Stream')
                    return;
                token.metadata = prop;
                break;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
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
                var root = getMetadataRoot(metadataContext);
                var schema = root.schemas.filter(function (it) { return prop.type.indexOf(it.namespace) == 0; })[0];
                if (!schema)
                    return;
                var entityType = schema.entityTypes.filter(function (it) { return it.name == prop.type.split('.').pop(); })[0];
                if (!entityType)
                    return;
                token.metadata = entityType;
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
                var root = getMetadataRoot(metadataContext);
                var schema = root.schemas.filter(function (it) { return prop.type.slice(11, -1).indexOf(it.namespace) == 0; })[0];
                if (!schema)
                    return;
                var entityType = schema.entityTypes.filter(function (it) { return it.name == prop.type.slice(11, -1).split('.').pop(); })[0];
                if (!entityType)
                    return;
                token.metadata = entityType;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.entityColNavigationProperty = entityColNavigationProperty;
function action(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.Action);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationType('action', metadataContext, token, isCollection, false, false, "entityTypes");
        if (!type)
            return;
    }
    return token;
}
exports.action = action;
function actionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ActionImport);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationImportType('action', metadataContext, token);
        if (!type)
            return;
    }
    return token;
}
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
function getOperationType(operation, metadataContext, token, isBoundCollection, isCollection, isPrimitive, types) {
    var bindingParameterType = metadataContext.parent.namespace + "." + metadataContext.name;
    if (isBoundCollection)
        bindingParameterType = "Collection(" + bindingParameterType + ")";
    var fnDef;
    var root = getMetadataRoot(metadataContext);
    for (var i = 0; i < root.schemas.length; i++) {
        var schema = root.schemas[i];
        for (var j = 0; j < schema[operation + 's'].length; j++) {
            var fn = schema[operation + 's'][j];
            if (fn.name == token.raw && fn.isBound) {
                for (var k = 0; k < fn.parameters.length; k++) {
                    var param = fn.parameters[k];
                    if (param.name == "bindingParameter" && param.type == bindingParameterType) {
                        fnDef = fn;
                        break;
                    }
                }
            }
            if (fnDef)
                break;
        }
        if (fnDef)
            break;
    }
    if (!fnDef)
        return;
    if (operation == 'action')
        return fnDef;
    if (fnDef.returnType.type.indexOf('Collection') == isCollection ? -1 : 0)
        return;
    var elementType = isCollection ? fnDef.returnType.type.slice(11, -1) : fnDef.returnType.type;
    if (isPrimitiveTypeName(elementType) && !isPrimitive)
        return;
    if (!isPrimitiveTypeName(elementType) && isPrimitive)
        return;
    if (isPrimitive)
        return elementType;
    var type;
    for (var i = 0; i < root.schemas.length; i++) {
        var schema = root.schemas[i];
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
function entityFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityFunction);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationType('function', metadataContext, token, isCollection, false, false, "entityTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityFunction = entityFunction;
function entityColFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunction);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationType('function', metadataContext, token, isCollection, true, false, "entityTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityColFunction = entityColFunction;
function complexFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexFunction);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationType('function', metadataContext, token, isCollection, false, false, "complexTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexFunction = complexFunction;
function complexColFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunction);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationType('function', metadataContext, token, isCollection, true, false, "complexTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexColFunction = complexColFunction;
function primitiveFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunction);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationType('function', metadataContext, token, isCollection, false, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveFunction = primitiveFunction;
function primitiveColFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunction);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationType('function', metadataContext, token, isCollection, true, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveColFunction = primitiveColFunction;
function getOperationImportType(operation, metadataContext, token, isCollection, isPrimitive, types) {
    var fnImport;
    for (var i = 0; i < metadataContext.dataServices.schemas.length; i++) {
        var schema = metadataContext.dataServices.schemas[i];
        for (var j = 0; j < schema.entityContainer.length; j++) {
            var container = schema.entityContainer[j];
            for (var k = 0; k < container[operation + 'Imports'].length; k++) {
                var it = container[operation + 'Imports'][k];
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
        if (fnImport[operation].indexOf(schema.namespace) == 0) {
            for (var j = 0; j < schema[operation + 's'].length; j++) {
                var it = schema[operation + 's'][j];
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
    if (operation == 'action')
        return fn;
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
        var type = getOperationImportType('function', metadataContext, token, false, false, "entityTypes");
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
        var type = getOperationImportType('function', metadataContext, token, true, false, "entityTypes");
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
        var type = getOperationImportType('function', metadataContext, token, false, false, "complexTypes");
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
        var type = getOperationImportType('function', metadataContext, token, true, false, "complexTypes");
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
        var type = getOperationImportType('function', metadataContext, token, false, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveFunctionImport = primitiveFunctionImport;
function primitiveColFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext == 'object') {
        var type = getOperationImportType('function', metadataContext, token, true, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveColFunctionImport = primitiveColFunctionImport;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFLLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBQzdGLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBRW5CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sZUFBZSxJQUFJLFFBQVEsQ0FBQyxDQUFBLENBQUM7UUFDdkMsSUFBSSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xGLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ2xCLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2QsQ0FBQztBQVhlLGtDQUEwQiw2QkFXekMsQ0FBQSIsImZpbGUiOiJuYW1lT3JJZGVudGlmaWVyLmpzIiwic291cmNlUm9vdCI6Ii4uL3NyYyJ9
