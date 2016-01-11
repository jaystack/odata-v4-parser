import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Expressions from './expressions';

var parserFactory = function(fn){
	return function (source, options) {
		var raw = new Uint8Array(source.length);
		var pos = 0;
		var tokens = [];
		for (var i = 0; i < source.length; i++) {
			raw[i] = source.charCodeAt(i);
		}
		while (pos < raw.length) {
			var token = fn(raw, pos);
			if (token) {
				pos = token.next;
				tokens.push(token);
			} else {
				pos++;
			}
		}
		return tokens.length > 1 ? tokens : tokens[0];
	};
};

export class Parser{
	filter(source:string, options:any):Lexer.Token { return parserFactory(Expressions.boolCommonExpr)(source, options) }
	keys(source:string, options:any):Lexer.Token { return parserFactory(Expressions.keyPredicate)(source, options) }
	literal(source:string, options:any):Lexer.Token { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options) }
}
