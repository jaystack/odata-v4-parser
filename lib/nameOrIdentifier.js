var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
var odata_metadata_1 = require('odata-metadata');
function enumeration(value, index) {
    var type = qualifiedEnumTypeName(value, index);
    if (!type)
        return;
    var start = index;
    index = type.next;
    if (!Lexer.SQUOTE(value[index]))
        return;
    index++;
    var enumVal = enumValue(value, index);
    if (!enumVal)
        return;
    index = enumVal.next;
    if (!Lexer.SQUOTE(value[index]))
        return;
    index++;
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
        if (Lexer.COMMA(value[val.next])) {
            index++;
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
function singleQualifiedTypeName(value, index, metadata) {
    return qualifiedEntityTypeName(value, index, metadata) ||
        qualifiedComplexTypeName(value, index) ||
        qualifiedTypeDefinitionName(value, index) ||
        qualifiedEnumTypeName(value, index) ||
        primitiveTypeName(value, index);
}
exports.singleQualifiedTypeName = singleQualifiedTypeName;
function qualifiedTypeName(value, index, metadata) {
    if (Utils.equals(value, index, 'Collection')) {
        var start = index;
        index += 10;
        if (!Lexer.SQUOTE(value[index]))
            return;
        index++;
        var token = singleQualifiedTypeName(value, index, metadata);
        if (!token)
            return;
        else
            index = token.next;
        if (!Lexer.SQUOTE(value[index]))
            return;
        index++;
        token.position = start;
        token.next = index;
        token.raw = Utils.stringify(value, token.position, token.next);
        token.type = Lexer.TokenType.Collection;
    }
    else
        return singleQualifiedTypeName(value, index, metadata);
}
exports.qualifiedTypeName = qualifiedTypeName;
;
function qualifiedEntityTypeName(value, index, metadata) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext == index || value[namespaceNext] != 0x2e)
        return;
    var nameNext = entityTypeName(value, namespaceNext + 1, metadata);
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
function typeSafeODataIdentifier(tokenType, type, value, index, metadata, filter) {
    var token = odataIdentifier(value, index, tokenType);
    if (token && Utils.metadata(token.raw, metadata, type, filter))
        return token;
}
function namespacePart(value, index) { return odataIdentifier(value, index, Lexer.TokenType.NamespacePart); }
exports.namespacePart = namespacePart;
function entitySetName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EntitySetName); }
exports.entitySetName = entitySetName;
function singletonEntity(value, index) { return odataIdentifier(value, index, Lexer.TokenType.SingletonEntity); }
exports.singletonEntity = singletonEntity;
function entityTypeName(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.EntityTypeName, odata_metadata_1.Edm.EntityType, value, index, metadata);
}
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
var primitiveTypes = [
    'Edm.Binary', 'Edm.Boolean', 'Edm.Byte', 'Edm.Date', 'Edm.DateTimeOffset', 'Edm.Decimal', 'Edm.Double', 'Edm.Duration', 'Edm.Guid',
    'Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.SByte', 'Edm.Single', 'Edm.Stream', 'Edm.String', 'Edm.TimeOfDay',
    'Edm.GeographyCollection', 'Edm.GeographyLineString', 'Edm.GeographyMultiLineString', 'Edm.GeographyMultiPoint', 'Edm.GeographyMultiPolygon', 'Edm.GeographyPoint', 'Edm.GeographyPolygon',
    'Edm.GeometryCollection', 'Edm.GeometryLineString', 'Edm.GeometryMultiLineString', 'Edm.GeometryMultiPoint', 'Edm.GeometryMultiPolygon', 'Edm.GeometryPoint', 'Edm.GeometryPolygon'
];
function isPrimitiveTypeName(type) {
    return primitiveTypes.indexOf(type) >= 0;
}
function primitiveProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.PrimitiveProperty, odata_metadata_1.Edm.Property, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == -1 && isPrimitiveTypeName(prop.type);
    });
}
exports.primitiveProperty = primitiveProperty;
function primitiveKeyProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.PrimitiveKeyProperty, odata_metadata_1.Edm.Property, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == -1 && isPrimitiveTypeName(prop.type) && prop.parent.key.propertyRefs.filter(function (ref) { return ref.name == name; }).length > 0;
    });
}
exports.primitiveKeyProperty = primitiveKeyProperty;
function primitiveNonKeyProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.PrimitiveNonKeyProperty, odata_metadata_1.Edm.Property, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == -1 && isPrimitiveTypeName(prop.type) && prop.parent.key.propertyRefs.filter(function (ref) { return ref.name == name; }).length == 0;
    });
}
exports.primitiveNonKeyProperty = primitiveNonKeyProperty;
function primitiveColProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.PrimitiveCollectionProperty, odata_metadata_1.Edm.Property, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == 0 && isPrimitiveTypeName(prop.type.slice(11, -1));
    });
}
exports.primitiveColProperty = primitiveColProperty;
function complexProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.ComplexProperty, odata_metadata_1.Edm.Property, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == -1 && !isPrimitiveTypeName(prop.type);
    });
}
exports.complexProperty = complexProperty;
function complexColProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.ComplexColProperty, odata_metadata_1.Edm.Property, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == 0 && isPrimitiveTypeName(prop.type.slice(11, -1));
    });
}
exports.complexColProperty = complexColProperty;
function streamProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.StreamProperty, odata_metadata_1.Edm.Property, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type == 'Edm.Stream';
    });
}
exports.streamProperty = streamProperty;
function navigationProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.NavigationProperty, odata_metadata_1.Edm.NavigationProperty, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == -1;
    });
}
exports.navigationProperty = navigationProperty;
function entityNavigationProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.EntityNavigationProperty, odata_metadata_1.Edm.NavigationProperty, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == -1;
    });
}
exports.entityNavigationProperty = entityNavigationProperty;
function entityColNavigationProperty(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.EntityCollectionNavigationProperty, odata_metadata_1.Edm.NavigationProperty, value, index, metadata, function (prop, name) {
        return prop.name == name && prop.type.indexOf('Collection') == 0;
    });
}
exports.entityColNavigationProperty = entityColNavigationProperty;
function action(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.Action, odata_metadata_1.Edm.Action, value, index, metadata);
}
exports.action = action;
function actionImport(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.ActionImport, odata_metadata_1.Edm.ActionImport, value, index, metadata);
}
exports.actionImport = actionImport;
function odataFunction(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.Function, odata_metadata_1.Edm.Function, value, index, metadata);
}
exports.odataFunction = odataFunction;
function entityFunction(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.EntityFunction, odata_metadata_1.Edm.Function, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == -1 && metadata.dataServices.schemas.filter(function (schema) {
            return schema.entityTypes.filter(function (entityType) {
                return entityType.name == fn.returnType.type;
            }).length > 0;
        }).length > 0;
    });
}
exports.entityFunction = entityFunction;
function entityColFunction(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.EntityCollectionFunction, odata_metadata_1.Edm.Function, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == 0 && metadata.dataServices.schemas.filter(function (schema) {
            return schema.entityTypes.filter(function (entityType) {
                return entityType.name == fn.returnType.type.slice(11, -1);
            }).length > 0;
        }).length > 0;
    });
}
exports.entityColFunction = entityColFunction;
function complexFunction(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.ComplexFunction, odata_metadata_1.Edm.Function, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == -1 && !isPrimitiveTypeName(fn.returnType.type);
    });
}
exports.complexFunction = complexFunction;
function complexColFunction(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.ComplexCollectionFunction, odata_metadata_1.Edm.Function, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == 0 && !isPrimitiveTypeName(fn.returnType.type.slice(11, -1));
    });
}
exports.complexColFunction = complexColFunction;
function primitiveFunction(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.PrimitiveFunction, odata_metadata_1.Edm.Function, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == -1 && isPrimitiveTypeName(fn.returnType.type);
    });
}
exports.primitiveFunction = primitiveFunction;
function primitiveColFunction(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.PrimitiveCollectionFunction, odata_metadata_1.Edm.Function, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == 0 && isPrimitiveTypeName(fn.returnType.type.slice(11, -1));
    });
}
exports.primitiveColFunction = primitiveColFunction;
//fn imports
function entityFunctionImport(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.EntityFunctionImport, odata_metadata_1.Edm.FunctionImport, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == -1 && metadata.dataServices.schemas.filter(function (schema) {
            return schema.entityTypes.filter(function (entityType) {
                return entityType.name == fn.returnType.type;
            }).length > 0;
        }).length > 0;
    });
}
exports.entityFunctionImport = entityFunctionImport;
function entityColFunctionImport(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.EntityCollectionFunctionImport, odata_metadata_1.Edm.FunctionImport, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == 0 && metadata.dataServices.schemas.filter(function (schema) {
            return schema.entityTypes.filter(function (entityType) {
                return entityType.name == fn.returnType.type.slice(11, -1);
            }).length > 0;
        }).length > 0;
    });
}
exports.entityColFunctionImport = entityColFunctionImport;
function complexFunctionImport(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.ComplexFunctionImport, odata_metadata_1.Edm.FunctionImport, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == -1 && !isPrimitiveTypeName(fn.returnType.type);
    });
}
exports.complexFunctionImport = complexFunctionImport;
function complexColFunctionImport(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.ComplexCollectionFunctionImport, odata_metadata_1.Edm.FunctionImport, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == 0 && !isPrimitiveTypeName(fn.returnType.type.slice(11, -1));
    });
}
exports.complexColFunctionImport = complexColFunctionImport;
function primitiveFunctionImport(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.PrimitiveFunctionImport, odata_metadata_1.Edm.FunctionImport, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == -1 && isPrimitiveTypeName(fn.returnType.type);
    });
}
exports.primitiveFunctionImport = primitiveFunctionImport;
function primitiveColFunctionImport(value, index, metadata) {
    return typeSafeODataIdentifier(Lexer.TokenType.PrimitiveCollectionFunctionImport, odata_metadata_1.Edm.FunctionImport, value, index, metadata, function (fn, name) {
        return fn.name == name && fn.returnType.type.indexOf('Collection') == 0 && isPrimitiveTypeName(fn.returnType.type.slice(11, -1));
    });
}
exports.primitiveColFunctionImport = primitiveColFunctionImport;
