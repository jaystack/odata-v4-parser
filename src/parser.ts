import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Expressions from './expressions';
import { Edm } from 'odata-metadata';

var parserFactory = function(fn){
	return function (source, options, metadata) {
		var raw = new Uint8Array(source.length);
		var pos = 0;
		var tokens = [];
		for (var i = 0; i < source.length; i++) {
			raw[i] = source.charCodeAt(i);
		}
		while (pos < raw.length) {
			var token = fn(raw, pos, metadata);
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

/*function crawler(source, destination){
	for (var prop in source){
		if (prop != 'parent' && source.hasOwnProperty(prop)){
			if (Array.isArray(source[prop])){
				source[prop].forEach(function(it){
					if (typeof it == 'object' && it){
						var name = Object.getPrototypeOf(it).constructor.name;
						console.log('=>', name);
						if (!destination[name]) destination[name] = {};
						destination[name][it.name] = it;
						crawler(it, destination);
					}
				});
			}else if (typeof source[prop] == 'object' && source[prop]){
				var name = Object.getPrototypeOf(source[prop]).constructor.name;
				console.log('=>', name);
				if (!destination[name]) destination[name] = {};
				destination[name][prop] = source[prop];
				crawler(source[prop], destination);
			}
		}
	}
}*/

export class Parser{
	metadata:any
	constructor(metadata?:any){
		if (metadata) this.metadata = new Edm.Edmx(metadata);
	}
	filter(source:string, options?:any):Lexer.Token { return parserFactory(Expressions.boolCommonExpr)(source, options, this.metadata); }
	keys(source:string, options?:any):Lexer.Token { return parserFactory(Expressions.keyPredicate)(source, options, this.metadata); }
	literal(source:string, options?:any):Lexer.Token { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options, this.metadata); }
}
