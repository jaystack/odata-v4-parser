import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Expressions from './expressions';
import * as Query from './query';
import * as ResourcePath from './resourcePath';
import * as ODataUri from './odataUri';

var parserFactory = function(fn){
	return function (source, options) {
		options = options || {};
		var raw = new Uint8Array(source.length);
		var pos = 0;
		for (var i = 0; i < source.length; i++) {
			raw[i] = source.charCodeAt(i);
		}
		return fn(raw, pos, options.metadata);
		/*while (pos < raw.length) {
			var token = fn(raw, pos, options.metadata);
			if (token) {
				pos = token.next;
				tokens.push(token);
			} else {
				throw new Error('Fail at ' + pos);
			}
		}
		return tokens.length > 1 ? tokens : tokens[0];*/
	};
};

export class Parser{
	odataUri(source:string, options?:any):Lexer.Token { return parserFactory(ODataUri.odataUri)(source, options); }
	resourcePath(source:string, options?:any):Lexer.Token { return parserFactory(ResourcePath.resourcePath)(source, options); }
	query(source:string, options?:any):Lexer.Token { return parserFactory(Query.queryOptions)(source, options); }
	filter(source:string, options?:any):Lexer.Token { return parserFactory(Expressions.boolCommonExpr)(source, options); }
	keys(source:string, options?:any):Lexer.Token { return parserFactory(Expressions.keyPredicate)(source, options); }
	literal(source:string, options?:any):Lexer.Token { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options); }
}

export function odataUri(source:string, options?:any):Lexer.Token { return parserFactory(ODataUri.odataUri)(source, options); }
export function resourcePath(source:string, options?:any):Lexer.Token { return parserFactory(ResourcePath.resourcePath)(source, options); }
export function query(source:string, options?:any):Lexer.Token { return parserFactory(Query.queryOptions)(source, options); }
export function filter(source:string, options?:any):Lexer.Token { return parserFactory(Expressions.boolCommonExpr)(source, options); }
export function keys(source:string, options?:any):Lexer.Token { return parserFactory(Expressions.keyPredicate)(source, options); }
export function literal(source:string, options?:any):Lexer.Token { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options); }