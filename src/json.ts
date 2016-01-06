import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as Expressions from './expressions';

export function complexColInUri(value:number[], index:number):Lexer.Token {
	var begin = Lexer.beginArray(value, index);
	if (begin == index) return;
	var start = index;
	index = begin;

	var items = [];
	var token = complexInUri(value, index);
	if (token){
		while (token){
			items.push(token);
			index = token.next;

			var end = Lexer.endArray(value, index);
			if (end > index){
				index = end;
				break;
			}else{
				var separator = Lexer.valueSeparator(value, index);
				if (separator == index) return;
				index = separator;

				token = complexInUri(value, index);
				if (!token) return;
			}
		}
	}else{
		var end = Lexer.endArray(value, index);
		if (end == index) return;
		index = end;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
}

export function complexInUri(value:number[], index:number):Lexer.Token {
	var begin = Lexer.beginObject(value, index);
	if (begin == index) return;
	var start = index;
	index = begin;

	var items = [];
	var token = annotationInUri(value, index) ||
		primitivePropertyInUri(value, index) ||
		complexPropertyInUri(value, index) ||
		collectionPropertyInUri(value, index) ||
		navigationPropertyInUri(value, index);
	if (token){
		while (token){
			items.push(token);
			index = token.next;

			var end = Lexer.endObject(value, index);
			if (end > index){
				index = end;
				break;
			}else{
				var separator = Lexer.valueSeparator(value, index);
				if (separator == index) return;
				index = separator;

				token = annotationInUri(value, index) ||
					primitivePropertyInUri(value, index) ||
					complexPropertyInUri(value, index) ||
					collectionPropertyInUri(value, index) ||
					navigationPropertyInUri(value, index);
				if (!token) return;
			}
		}
	}else{
		var end = Lexer.endObject(value, index);
		if (end == index) return;
		index = end;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Object);
}

export function collectionPropertyInUri(value:number[], index:number):Lexer.Token {
	var mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	var start = index;
	index = mark;

	var prop = NameOrIdentifier.primitiveColProperty(value, index) ||
		NameOrIdentifier.complexColProperty(value, index);

	if (!prop) return;
	index = prop.next;

	mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	index = mark;

	var separator = Lexer.nameSeparator(value, index);
	if (separator == index) return;
	index = separator;

	var propValue = prop.type == Lexer.TokenType.PrimitiveCollectionProperty
		? primitiveColInUri(value, index)
		: complexColInUri(value, index);

	if (!propValue) return;
	index = propValue.next;

	return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}

export function primitiveColInUri(value:number[], index:number):Lexer.Token {
	var begin = Lexer.beginArray(value, index);
	if (begin == index) return;
	var start = index;
	index = begin;

	var items = [];
	var token = primitiveLiteralInJSON(value, index);
	if (token){
		while (token){
			items.push(token);
			index = token.next;

			var end = Lexer.endArray(value, index);
			if (end > index){
				index = end;
				break;
			}else{
				var separator = Lexer.valueSeparator(value, index);
				if (separator == index) return;
				index = separator;

				token = primitiveLiteralInJSON(value, index);
				if (!token) return;
			}
		}
	}else{
		var end = Lexer.endArray(value, index);
		if (end == index) return;
		index = end;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
}

export function complexPropertyInUri(value:number[], index:number):Lexer.Token {
	var mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	var start = index;
	index = mark;

	var prop = NameOrIdentifier.complexProperty(value, index);
	if (!prop) return;
	index = prop.next;

	mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	index = mark;

	var separator = Lexer.nameSeparator(value, index);
	if (separator == index) return;
	index = separator;

	var propValue = complexInUri(value, index);
	if (!propValue) return;
	index = propValue.next;

	return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}

export function annotationInUri(value:number[], index:number):Lexer.Token {
	var mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	var start = index;
	index = mark;

	if (!Lexer.AT(value[index])) return;
	index++;

	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index) return;
	var namespaceStart = index;
	index = namespaceNext;

	if (value[index] != 0x2e) return;
	index++;

	var term = NameOrIdentifier.termName(value, index);
	if (!term) return;
	index = term.next;

	mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	index = mark;

	var separator = Lexer.nameSeparator(value, index);
	if (separator == index) return;
	index = separator;

	var token = complexInUri(value, index) ||
		complexColInUri(value, index) ||
		primitiveLiteralInJSON(value, index) ||
		primitiveColInUri(value, index);
	if (!token) return;
	index = token.next;

	return Lexer.tokenize(value, start, index, {
		key: '@' + Utils.stringify(value, namespaceStart, namespaceNext) + '.' + term.raw,
		value: token
	}, Lexer.TokenType.Annotation);
}

export function keyValuePairInUri(value:number[], index:number, keyFn:Function, valueFn:Function):Lexer.Token {
	var mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	var start = index;
	index = mark;

	var prop = keyFn(value, index);
	if (!prop) return;
	index = prop.next;

	mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	index = mark;

	var separator = Lexer.nameSeparator(value, index);
	if (separator == index) return;
	index = separator;

	var propValue = valueFn(value, index);
	if (!propValue) return;
	index = propValue.next;

	return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}

export function primitivePropertyInUri(value:number[], index:number):Lexer.Token {
	return keyValuePairInUri(value, index, NameOrIdentifier.primitiveProperty, primitiveLiteralInJSON);
}

export function navigationPropertyInUri(value:number[], index:number):Lexer.Token {
	return singleNavPropInJSON(value, index) ||
		collectionNavPropInJSON(value, index);
}

export function singleNavPropInJSON(value:number[], index:number):Lexer.Token {
	return keyValuePairInUri(value, index, NameOrIdentifier.entityNavigationProperty, Expressions.rootExpr);
}

export function collectionNavPropInJSON(value:number[], index:number):Lexer.Token {
	return keyValuePairInUri(value, index, NameOrIdentifier.entityColNavigationProperty, rootExprCol);
}

export function rootExprCol(value:number[], index:number):Lexer.Token {
	var begin = Lexer.beginArray(value, index);
	if (begin == index) return;
	var start = index;
	index = begin;

	var items = [];
	var token = Expressions.rootExpr(value, index);
	if (token){
		while (token){
			items.push(token);
			index = token.next;

			var end = Lexer.endArray(value, index);
			if (end > index){
				index = end;
				break;
			}else{
				var separator = Lexer.valueSeparator(value, index);
				if (separator == index) return;
				index = separator;

				token = Expressions.rootExpr(value, index);
				if (!token) return;
			}
		}
	}else{
		var end = Lexer.endArray(value, index);
		if (end == index) return;
		index = end;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
}

export function primitiveLiteralInJSON(value:number[], index:number):Lexer.Token {
	return stringInJSON(value, index) ||
		numberInJSON(value, index) ||
		booleanInJSON(value, index) ||
		nullInJSON(value, index);
}

export function stringInJSON(value:number[], index:number):Lexer.Token {
	var mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	var start = index;
	index = mark;

	var char = charInJSON(value, index);
	while (char > index){
		index = char;
		char = charInJSON(value, index);
	}

	mark = Lexer.quotationMark(value, index);
	if (mark == index) return;
	index = mark;

	return Lexer.tokenize(value, start, index, 'string', Lexer.TokenType.Literal);
}

export function charInJSON(value:number[], index:number):number {
	var escape = Lexer.escape(value, index);
	if (escape > index){
		if (Utils.equals(value, escape, '%2F')) return escape + 3;
		if (Utils.equals(value, escape, '/') ||
			Utils.equals(value, escape, 'b') ||
			Utils.equals(value, escape, 'f') ||
			Utils.equals(value, escape, 'n') ||
			Utils.equals(value, escape, 'r') ||
			Utils.equals(value, escape, 't')) return escape + 1;
		if (Utils.equals(value, escape, 'u') &&
			Utils.required(value, escape + 1, Lexer.HEXDIG, 4, 4)) return escape + 5;
		var escapeNext = Lexer.escape(value, escape);
		if (escapeNext > escape) return escapeNext;
		var mark = Lexer.quotationMark(value, escape);
		if (mark > escape) return mark;
	}else{
		var mark = Lexer.quotationMark(value, index);
		if (mark == index) return index + 1;
	}
}

export function numberInJSON(value:number[], index:number):Lexer.Token {
	var token = PrimitiveLiteral.doubleValue(value, index) ||
		PrimitiveLiteral.int64Value(value, index);
	if (token){
		token.value = 'number';
		return token;
	}
}

export function booleanInJSON(value:number[], index:number):Lexer.Token {
	if (Utils.equals(value, index, 'true')) return Lexer.tokenize(value, index, index + 4, 'boolean', Lexer.TokenType.Literal);
	if (Utils.equals(value, index, 'false')) return Lexer.tokenize(value, index, index + 5, 'boolean', Lexer.TokenType.Literal);
}

export function nullInJSON(value:number[], index:number):Lexer.Token {
	if (Utils.equals(value, index, 'null')) return Lexer.tokenize(value, index, index + 4, 'null', Lexer.TokenType.Literal);
}

export function arrayOrObject(value:number[], index:number):Lexer.Token {
	var token = complexColInUri(value, index) ||
		complexInUri(value, index) ||
		rootExprCol(value, index) ||
		primitiveColInUri(value, index);

	if (token) return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.ArrayOrObject);
}
