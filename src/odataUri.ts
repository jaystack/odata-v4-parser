import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Expressions from './expressions';
import * as Query from './query';
import * as ResourcePath from './resourcePath';

export function odataUri(value:number[] | Uint8Array, index:number, metadataContext?:any):Lexer.Token {
	var resource = ResourcePath.resourcePath(value, index, metadataContext);
	while (!resource && index < value.length){
		while (value[++index] != 0x2f && index < value.length);
		resource = ResourcePath.resourcePath(value, index, metadataContext);
	}
	if (!resource) return;
	var start = index;
	index = resource.next;

	var query;
	if (value[index] == 0x3f){
		query = Query.queryOptions(value, index + 1);
		if (!query) return;
		index = query.next;
	}

	return Lexer.tokenize(value, start, index, { resource, query }, Lexer.TokenType.ODataUri);
}
