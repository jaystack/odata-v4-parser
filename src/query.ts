import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as Expressions from './expressions';

export function queryOptions(value:number[], index:number):Lexer.Token {
	var token = queryOption(value, index);
	if (!token) return;
	var start = index;
	index = token.next;

	var options = [];
	while (token){
		options.push(token);
		// &
		if (value[index] != 0x26) break;
		index++;

		token = queryOption(value, index);
		if (!token) return;
		index = token.next;
	}

	return Lexer.tokenize(value, start, index, { options }, Lexer.TokenType.QueryOptions);
}

export function queryOption(value:number[], index:number):Lexer.Token {
	return systemQueryOption(value, index) ||
		aliasAndValue(value, index);// ||
		// customQueryOption(value, index);
}

export function systemQueryOption(value:number[], index:number):Lexer.Token {
	// return expand(value, index) ||
	return filter(value, index) ||
		format(value, index) ||
		id(value, index) ||
		inlinecount(value, index) ||
		orderby(value, index) ||
		// search(value, index) ||
		select(value, index) ||
		skip(value, index) ||
		// skiptoken(value, index) ||
		top(value, index);
}

export function id(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$id')) return;
	var start = index;
	index += 3;

	if (!Lexer.EQ(value[index])) return;
	index++;

	//TODO: navigation
}

export function filter(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$filter')) return;
	var start = index;
	index += 7;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var expr = Expressions.boolCommonExpr(value, index);
	if (!expr) return;
	index = expr.next;

	return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Filter);
}

export function orderby(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$orderby')) return;
	var start = index;
	index += 8;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var items = [];
	var token = orderbyItem(value, index);
	if (!token) return;
	index = token.next;

	while (token){
		items.push(token);

		if (Lexer.COMMA(value[index])){
			index++;
			var token = orderbyItem(value, index);
			if (!token) return;
			index = token.next;
		}else break;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.OrderBy);
}

export function orderbyItem(value:number[], index:number):Lexer.Token {
	var expr = Expressions.commonExpr(value, index);
	if (!expr) return;
	var start = index;
	index = expr.next;

	var direction = 1;
	var rws = Lexer.RWS(value, index);
	if (rws > index){
		index = rws;
		if (Utils.equals(value, index, 'asc')) index += 3;
		else if (Utils.equals(value, index, 'desc')){
			index += 4;
			direction = -1;
		}else return;
	}

	return Lexer.tokenize(value, start, index, { expr, direction }, Lexer.TokenType.OrderByItem);
}

export function skip(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$skip')) return;
	var start = index;
	index += 5;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var token = PrimitiveLiteral.int32Value(value, index);
	if (!token) return;
	index = token.next;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Skip);
}

export function top(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$top')) return;
	var start = index;
	index += 4;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var token = PrimitiveLiteral.int32Value(value, index);
	if (!token) return;
	index = token.next;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Top);
}

export function format(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$format')) return;
	var start = index;
	index += 7;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var format;
	if (Utils.equals(value, index, 'atom')){
		format = 'atom';
		index += 4;
	}else if (Utils.equals(value, index, 'json')){
		format = 'json';
		index += 4;
	}else if (Utils.equals(value, index, 'xml')){
		format = 'xml';
		index += 3;
	}

	if (format) return Lexer.tokenize(value, start, index, { format }, Lexer.TokenType.Format);
}

export function inlinecount(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$count')) return;
	var start = index;
	index += 6;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var token = PrimitiveLiteral.booleanValue(value, index);
	if (!token) return;
	index = token.next;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.InlineCount);
}

//TODO: search

export function select(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$select')) return;
	var start = index;
	index += 7;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var items = [];
	var token = selectItem(value, index);
	if (!token) return;
	while (token){
		items.push(token);
		index = token.next;

		if (Lexer.COMMA(value[index])){
			index++;
			token = selectItem(value, index);
			if (!token) return;
		}else break;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Select);
}

export function selectItem(value:number[], index:number):Lexer.Token {
	var start = index;
	var item;
	var op = allOperationsInSchema(value, index);
	if (op > index){
		item = { namespace: Utils.stringify(value, index, op - 2), value: '*' };
		index = op;
	}else if (Lexer.STAR(value[index])){
		item = { value: '*' };
		index++;
	}else{
		var name = NameOrIdentifier.qualifiedEntityTypeName(value, index) ||
			NameOrIdentifier.qualifiedComplexTypeName(value, index);

		if (name && value[name.next] != 0x2f) return;
		else if (name && value[name.next] == 0x2f){
			index++;
			item.name = name;
		}

		var select = selectProperty(value, index) ||
			qualifiedActionName(value, index) ||
			qualifiedFunctionName(value, index);
		if (!select) return;
		index = select.next;

		item = name ? { name, select } : select;
	}

	if (index > start) return Lexer.tokenize(value, start, index, item, Lexer.TokenType.SelectItem);
}

export function allOperationsInSchema(value:number[], index:number):number {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext > index && value[namespaceNext] == 0x2e && Lexer.STAR(value[namespaceNext + 1])) return namespaceNext + 2;
	return index;
}

export function selectProperty(value:number[], index:number):Lexer.Token {
	var token = selectPath(value, index) ||
		NameOrIdentifier.primitiveProperty(value, index) ||
		NameOrIdentifier.primitiveColProperty(value, index) ||
		NameOrIdentifier.navigationProperty(value, index);
	if (!token) return;
	var start = index;
	index = token.next;

	if (token.type == Lexer.TokenType.SelectPath){
		if (value[index] == 0x2f){
			index++;
			var prop = selectProperty(value, index);
			if (!prop) return;
			var path = Lexer.clone(token);
			token.next = prop.next;
			token.raw = Utils.stringify(value, start, token.next);
			token.value = { path, next: prop };
		}
	}

	return token;
}

export function selectPath(value:number[], index:number):Lexer.Token {
	var token = NameOrIdentifier.complexProperty(value, index) ||
		NameOrIdentifier.complexColProperty(value, index);
	if (!token) return;
	var start = index;
	index = token.next;

	var tokenValue:any = token;
	if (value[index] == 0x2f){
		index++;
		var name = NameOrIdentifier.qualifiedComplexTypeName(value, index);
		if (!name) return;
		index = name.next;
		tokenValue = { prop: token, name };
	}

	return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.SelectPath);
}

export function qualifiedActionName(value:number[], index:number):Lexer.Token {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var start = index;
	index = namespaceNext + 1;

	var action = NameOrIdentifier.action(value, index);
	if (!action) return;

	return Lexer.tokenize(value, start, action.next, action, Lexer.TokenType.Action);
}

export function qualifiedFunctionName(value:number[], index:number):Lexer.Token {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var start = index;
	index = namespaceNext + 1;

	var fn = NameOrIdentifier.odataFunction(value, index);
	if (!fn) return;
	index = fn.next;
	var tokenValue:any = { name: fn };

	if (Lexer.OPEN(value[index])){
		index++;
		tokenValue.parameters = [];
		var param = Expressions.parameterName(value, index);
		if (!param) return;

		while (param){
			index = param.next;
			tokenValue.parameters.push(param);

			if (Lexer.COMMA(value[index])){
				index++;
				var param = Expressions.parameterName(value, index);
				if (!param) return;
			}else break;
		}

		if (!Lexer.CLOSE(value[index])) return;
		index++;
	}

	return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.Function);
}

//TODO: skiptoken

export function aliasAndValue(value:number[], index:number):Lexer.Token {
	var alias = Expressions.parameterAlias(value, index);
	if (!alias) return;
	var start = index;
	index = alias.next;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var paramValue = Expressions.parameterValue(value, index);
	if (!paramValue) return;
	index = paramValue.next;

	return Lexer.tokenize(value, start, index, {
		alias,
		value: paramValue
	}, Lexer.TokenType.AliasAndValue);
}

//TODO: customQueryOption
