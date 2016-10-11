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
                if (prop.type.indexOf('Collection') == -1 || !isPrimitiveTypeName(prop.type.slice(11, -1)))
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
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionProperty);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEtBQTJCLEVBQUUsS0FBWSxFQUFFLGVBQW9CO0lBQ3RHLElBQUksS0FBSyxHQUFHLGVBQWUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUM3RixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQztJQUVuQixFQUFFLENBQUMsQ0FBQyxPQUFPLGVBQWUsSUFBSSxRQUFRLENBQUMsQ0FBQSxDQUFDO1FBQ3BDLElBQUksSUFBSSxHQUFHLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNsQixLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBWGUsa0NBQTBCLDZCQVd6QyxDQUFBIiwiZmlsZSI6Im5hbWVPcklkZW50aWZpZXIuanMiLCJzb3VyY2VSb290IjoiLi4vc3JjIn0=
