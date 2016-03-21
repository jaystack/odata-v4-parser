import { Edm } from 'odata-metadata';

export function stringify(value:number[] | Uint8Array, index:number, next:number):string{
	return Array.prototype.map.call(value.slice(index, next), function (ch) { return String.fromCharCode(ch); }).join('');
}

export function is(value:number, compare:string){
	for (var i = 0; i < compare.length; i++) {
		if (value == compare.charCodeAt(i)) return true;
	}

	return false;
}

export function equals(value:number[] | Uint8Array, index:number, compare:string){
	var i = 0;
	while (value[index + i] == compare.charCodeAt(i) && i < compare.length) {
		i++;
	}
	return i == compare.length ? i : 0;
}

export function required(value:number[] | Uint8Array, index:number, comparer:Function, min?:number, max?:number) {
	var i = 0;

	max = max || (value.length - index);
	while (i < max && comparer(value[index + i])) {
		i++;
	}

	return i >= (min || 0) && i <= max ? index + i : 0;
}

export function metadata(name:string, metadata:Edm.Edmx, type:Function, filter?:Function):boolean {
	switch (type){
		case Edm.Action:
		case Edm.Function:
			var prop = 'actions';
			if (type == Edm.Function) prop = 'functions';
			return metadata.dataServices.schemas.filter(function(schema){
				return schema[prop].filter(function(actionOrFunction){
					return (filter && filter(actionOrFunction, name)) || (!filter && actionOrFunction.name == name);
				}).length > 0;
			}).length > 0;
		case Edm.ActionImport:
		case Edm.FunctionImport:
			var prop = 'actions';
			var propImports = 'actionImports';
			if (type == Edm.FunctionImport){
				prop = 'functions';
				propImports = 'functionImports';
			}
			return metadata.dataServices.schemas.filter(function(schema){
				return schema.entityContainer.filter(function(container){
					return container[propImports].filter(function(actionImportOrFunctionImport){
						return metadata.dataServices.schemas.filter(function(schema){
							return schema[prop].filter(function(actionOrFunction){
								return actionOrFunction.name == actionImportOrFunctionImport.name && ((filter && filter(actionOrFunction, name)) || (!filter && actionOrFunction.name == name));
							}).length > 0;
						}).length > 0;
					}).length > 0;
				}).length > 0;
			}).length > 0;
		default:
			var propertiesName = 'properties';
			if (type == Edm.NavigationProperty) propertiesName = 'navigationProperties';

			return metadata.dataServices.schemas.filter(function(schema){
				return schema.entityTypes.filter(function(entityType){
					return (type != Edm.Property && type != Edm.NavigationProperty && ((filter && filter(entityType, name)) || (!filter && entityType.name == name)))
						|| entityType[propertiesName].filter(function(prop){
							return prop instanceof type && ((filter && filter(prop, name)) || (!filter && prop.name == name));
						}).length > 0;
				}).length > 0
				|| schema.complexTypes.filter(function(complexType){
					return (type != Edm.Property && type != Edm.NavigationProperty && ((filter && filter(complexType, name)) || (!filter && complexType.name == name)))
						|| complexType[propertiesName].filter(function(prop){
							return prop instanceof type && ((filter && filter(prop, name)) || (!filter && prop.name == name));
						}).length > 0;
				}).length > 0;
			}).length > 0;
	}
}
