var odata_metadata_1 = require('odata-metadata');
function stringify(value, index, next) {
    return Array.prototype.map.call(value.slice(index, next), function (ch) { return String.fromCharCode(ch); }).join('');
}
exports.stringify = stringify;
function is(value, compare) {
    for (var i = 0; i < compare.length; i++) {
        if (value == compare.charCodeAt(i))
            return true;
    }
    return false;
}
exports.is = is;
function equals(value, index, compare) {
    var i = 0;
    while (value[index + i] == compare.charCodeAt(i) && i < compare.length) {
        i++;
    }
    return i == compare.length ? i : 0;
}
exports.equals = equals;
function required(value, index, comparer, min, max) {
    var i = 0;
    max = max || (value.length - index);
    while (i < max && comparer(value[index + i])) {
        i++;
    }
    return i >= (min || 0) && i <= max ? index + i : 0;
}
exports.required = required;
function metadata(name, metadata, type, filter) {
    switch (type) {
        case odata_metadata_1.Edm.Action:
        case odata_metadata_1.Edm.Function:
            var prop = 'actions';
            if (type == odata_metadata_1.Edm.Function)
                prop = 'functions';
            return metadata.dataServices.schemas.filter(function (schema) {
                return schema[prop].filter(function (actionOrFunction) {
                    return (filter && filter(actionOrFunction, name)) || (!filter && actionOrFunction.name == name);
                }).length > 0;
            }).length > 0;
        case odata_metadata_1.Edm.ActionImport:
        case odata_metadata_1.Edm.FunctionImport:
            var prop = 'actions';
            var propImports = 'actionImports';
            if (type == odata_metadata_1.Edm.FunctionImport) {
                prop = 'functions';
                propImports = 'functionImports';
            }
            return metadata.dataServices.schemas.filter(function (schema) {
                return schema.entityContainer.filter(function (container) {
                    return container[propImports].filter(function (actionImportOrFunctionImport) {
                        return metadata.dataServices.schemas.filter(function (schema) {
                            return schema[prop].filter(function (actionOrFunction) {
                                return actionOrFunction.name == actionImportOrFunctionImport.name && ((filter && filter(actionOrFunction, name)) || (!filter && actionOrFunction.name == name));
                            }).length > 0;
                        }).length > 0;
                    }).length > 0;
                }).length > 0;
            }).length > 0;
        default:
            var propertiesName = 'properties';
            if (type == odata_metadata_1.Edm.NavigationProperty)
                propertiesName = 'navigationProperties';
            return metadata.dataServices.schemas.filter(function (schema) {
                return schema.entityTypes.filter(function (entityType) {
                    return (type != odata_metadata_1.Edm.Property && type != odata_metadata_1.Edm.NavigationProperty && ((filter && filter(entityType, name)) || (!filter && entityType.name == name)))
                        || entityType[propertiesName].filter(function (prop) {
                            return prop instanceof type && ((filter && filter(prop, name)) || (!filter && prop.name == name));
                        }).length > 0;
                }).length > 0
                    || schema.complexTypes.filter(function (complexType) {
                        return (type != odata_metadata_1.Edm.Property && type != odata_metadata_1.Edm.NavigationProperty && ((filter && filter(complexType, name)) || (!filter && complexType.name == name)))
                            || complexType[propertiesName].filter(function (prop) {
                                return prop instanceof type && ((filter && filter(prop, name)) || (!filter && prop.name == name));
                            }).length > 0;
                    }).length > 0;
            }).length > 0;
    }
}
exports.metadata = metadata;
