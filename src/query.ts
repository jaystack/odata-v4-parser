import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as Expressions from './expressions';

export function queryOptions(value:number[] | Uint8Array, index:number):Lexer.Token {
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

export function queryOption(value:number[] | Uint8Array, index:number):Lexer.Token {
	return systemQueryOption(value, index) ||
		aliasAndValue(value, index);// ||
		// customQueryOption(value, index);
}

export function systemQueryOption(value:number[] | Uint8Array, index:number):Lexer.Token {
	return expand(value, index) ||
		filter(value, index) ||
		format(value, index) ||
		id(value, index) ||
		inlinecount(value, index) ||
		orderby(value, index) ||
		search(value, index) ||
		select(value, index) ||
		skip(value, index) ||
		skiptoken(value, index) ||
		top(value, index);
}

export function id(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24id')){
		index += 5;
	}else
	if (Utils.equals(value, index, '$id')){
		index += 3;
	}else return;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	while (value[index] != 0x26 && index < value.length) index++;
	if (index == eq) return;

	return Lexer.tokenize(value, start, index, Utils.stringify(value, eq, index), Lexer.TokenType.Id);
}

export function expand(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24expand')){
		index += 9;
	}else
	if (Utils.equals(value, index, '$expand')){
		index += 7;
	}else return;
	
	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;
	
	var items = [];
	var token = expandItem(value, index);
	if (!token) return;
	index = token.next;

	while (token){
		items.push(token);

		var comma = Lexer.COMMA(value, index);
		if (comma){
			index = comma;
			var token = expandItem(value, index);
			if (!token) return;
			index = token.next;
		}else break;
	}
	
	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Expand);
}

export function expandItem(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	var star = Lexer.STAR(value, index);
	if (star){
		index = star;
		let ref = Expressions.refExpr(value, index);
		if (ref){
			index = ref.next;
			return Lexer.tokenize(value, start, index, { path: '*', ref }, Lexer.TokenType.ExpandItem);
		}else{
			var open = Lexer.OPEN(value, index);
			if (open){
				index = open;
				var token = levels(value, index);
				if (!token) return;
				index = token.next;
				
				var close = Lexer.CLOSE(value, index);
				if (!close) return;
				index = close;
				
				return Lexer.tokenize(value, start, index, { path: '*', levels: token }, Lexer.TokenType.ExpandItem);
			}
		}
	}
	
	var path = expandPath(value, index);
	if (!path) return;
	index = path.next;
	
	var tokenValue:any = { path };
	
	var ref = Expressions.refExpr(value, index);
	if (ref){
		index = ref.next;
		tokenValue.ref = ref;
		
		let open = Lexer.OPEN(value, index);
		if (open){
			index = open;
			
			let option = expandRefOption(value, index);
			if (!option) return;
			
			let refOptions = [];
			while (option){
				refOptions.push(option);
				index = option.next;
				
				let semi = Lexer.SEMI(value, index);
				if (semi){
					index = semi;
					
					option = expandRefOption(value, index);
					if (!option) return;
				}else break;
			}
			
			let close = Lexer.CLOSE(value, index);
			if (!close) return;
			index = close;
			
			tokenValue.options = refOptions;
		}
	}else{
		var count = Expressions.countExpr(value, index);
		if (count){
			index = count.next;
			tokenValue.count = count;
			
			let open = Lexer.OPEN(value, index);
			if (open){
				index = open;
				
				let option = expandCountOption(value, index);
				if (!option) return;
				
				let countOptions = [];
				while (option){
					countOptions.push(option);
					index = option.next;
					
					let semi = Lexer.SEMI(value, index);
					if (semi){
						index = semi;
						
						option = expandCountOption(value, index);
						if (!option) return;
					}else break;
				}
				
				let close = Lexer.CLOSE(value, index);
				if (!close) return;
				index = close;
				tokenValue.options = countOptions;
			}
		}else{
			var open = Lexer.OPEN(value, index);
			if (open){
				index = open;
				
				let option = expandOption(value, index);
				if (!option) return;
				
				let options = [];
				while (option){
					options.push(option);
					index = option.next;
					
					let semi = Lexer.SEMI(value, index);
					if (semi){
						index = semi;
						
						option = expandOption(value, index);
						if (!option) return;
					}else break;
				}
				
				let close = Lexer.CLOSE(value, index);
				if (!close) return;
				index = close;
				tokenValue.options = options;
			}
		}
	}
	
	return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.ExpandItem);
}

export function expandCountOption(value:number[] | Uint8Array, index:number):Lexer.Token {
	return filter(value, index) ||
		search(value, index);
}

export function expandRefOption(value:number[] | Uint8Array, index:number):Lexer.Token {
	return expandCountOption(value, index) ||
		orderby(value, index) ||
		skip(value, index) ||
		top(value, index) ||
		inlinecount(value, index);
}

export function expandOption(value:number[] | Uint8Array, index:number):Lexer.Token {
	return expandRefOption(value, index) ||
		select(value, index) ||
		expand(value, index) ||
		levels(value, index);
}

export function expandPath(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	var path = [];
	
	var token = NameOrIdentifier.qualifiedEntityTypeName(value, index) ||
		NameOrIdentifier.qualifiedComplexTypeName(value, index);
		
	if (token){
		index = token.next;
		path.push(token);
		if (value[index] != 0x2f) return;
		index++;
	}
	
	var complex = NameOrIdentifier.complexProperty(value, index) ||
		NameOrIdentifier.complexColProperty(value, index);
	while (complex){
		if (value[complex.next] == 0x2f){
			index = complex.next + 1;
			path.push(complex);
			
			var complexTypeName = NameOrIdentifier.qualifiedComplexTypeName(value, index);
			if (complexTypeName){
				if (value[complexTypeName.next] == 0x2f){
					index = complexTypeName.next + 1;
					path.push(complexTypeName);
				}
			}
			
			complex = NameOrIdentifier.complexProperty(value, index) ||
				NameOrIdentifier.complexColProperty(value, index);
		}else break;
	}
	
	var nav = NameOrIdentifier.navigationProperty(value, index);

	if (!nav) return;
	index = nav.next;
	path.push(nav);
	
	if (value[index] == 0x2f){
		var typeName = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1);
		if (typeName){;
			index = typeName.next;
			path.push(typeName);
		}
	}
	
	return Lexer.tokenize(value, start, index, path, Lexer.TokenType.ExpandPath);
}

export function search(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24search')){
		index += 9;
	}else
	if (Utils.equals(value, index, '$search')){
		index += 7;
	}else return;
	
	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;
	
	var expr = searchExpr(value, index);
	if (!expr) return;
	index = expr.next;
	
	return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Search);
}

export function searchExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	var token = searchParenExpr(value, index) ||
		searchTerm(value, index);
		
	if (!token) return;
	var start = index;
	index = token.next;
	
	var expr = searchAndExpr(value, index) ||
		searchOrExpr(value, index);
		
	if (expr){
		token.next = expr.value.next;
		token.value = {
			left: Lexer.clone(token),
			right: expr.value
		};
		token.type = expr.type;
		token.raw = Utils.stringify(value, token.position, token.next);
	}
	
	return token;
}

export function searchTerm(value:number[] | Uint8Array, index:number):Lexer.Token {
	return searchNotExpr(value, index) ||
		searchPhrase(value, index) ||
		searchWord(value, index);
}

export function searchNotExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'NOT')) return;
	var start = index;
	index += 3;
	
	var expr = searchPhrase(value, index) ||
		searchWord(value, index);
	if (!expr) return;
	index = expr.next;
	
	return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.SearchNotExpression);
}

export function searchOrExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	var rws = Lexer.RWS(value, index);
	if (rws == index || !Utils.equals(value, rws, 'OR')) return;
	var start = index;
	index = rws + 2;
	rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = searchExpr(value, index);
	if (!token) return;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.SearchOrExpression);
}

export function searchAndExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	var rws = Lexer.RWS(value, index);
	if (rws == index || !Utils.equals(value, rws, 'AND')) return;
	var start = index;
	index = rws + 3;
	rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = searchExpr(value, index);
	if (!token) return;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.SearchAndExpression);
}

export function searchPhrase(value:number[] | Uint8Array, index:number):Lexer.Token {
	var mark = Lexer.quotationMark(value, index);
	if (!mark) return;
	var start = index;
	index = mark;
	
	var valueStart = index;
	var ch = Lexer.qcharNoAMPDQUOTE(value, index);
	while (ch > index && !Lexer.OPEN(value, index) && !Lexer.CLOSE(value, index)){
		index = ch;
		ch = Lexer.qcharNoAMPDQUOTE(value, index);
	}
	var valueEnd = index;
	
	mark = Lexer.quotationMark(value, index);
	if (!mark) return;
	index = mark;
	
	return Lexer.tokenize(value, start, index, Utils.stringify(value, valueStart, valueEnd), Lexer.TokenType.SearchPhrase);
}

export function searchWord(value:number[] | Uint8Array, index:number):Lexer.Token {
	var next = Utils.required(value, index, Lexer.ALPHA, 1);
	if (!next) return;
	var start = index;
	index = next;
	
	var token = Lexer.tokenize(value, start, index, null, Lexer.TokenType.SearchWord);
	token.value = token.raw;
	return token;
}
	
export function searchParenExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	var open = Lexer.OPEN(value, index);
	if (!open) return;
	var start = index;
	index = open;
	index = Lexer.BWS(value, index);
	
	var expr = searchExpr(value, index);
	if (!expr) return;
	index = expr.next;
	
	index = Lexer.BWS(value, index);
	var close = Lexer.CLOSE(value, index);
	if (!close) return;
	index = close;
	
	return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.SearchParenExpression);
}

export function levels(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24levels')){
		index += 9;
	}else
	if (Utils.equals(value, index, '$levels')){
		index += 7;
	}else return;
	
	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;
	
	var level;
	if (Utils.equals(value, index, 'max')){
		level = 'max';
		index += 3;
	}else{
		var token = PrimitiveLiteral.int32Value(value, index);
		if (!token) return;
		level = token.raw;
		index = token.next;
	}
	
	return Lexer.tokenize(value, start, index, level, Lexer.TokenType.Levels);
}

export function filter(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24filter')){
		index += 9;
	}else
	if (Utils.equals(value, index, '$filter')){
		index += 7;
	}else return;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	var expr = Expressions.boolCommonExpr(value, index);
	if (!expr) return;
	index = expr.next;

	return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Filter);
}

export function orderby(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24orderby')){
		index += 10;
	}else
	if (Utils.equals(value, index, '$orderby')){
		index += 8;
	}else return;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	var items = [];
	var token = orderbyItem(value, index);
	if (!token) return;
	index = token.next;

	while (token){
		items.push(token);

		var comma = Lexer.COMMA(value, index);
		if (comma){
			index = comma;
			var token = orderbyItem(value, index);
			if (!token) return;
			index = token.next;
		}else break;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.OrderBy);
}

export function orderbyItem(value:number[] | Uint8Array, index:number):Lexer.Token {
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

export function skip(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24skip')){
		index += 7;
	}else
	if (Utils.equals(value, index, '$skip')){
		index += 5;
	}else return;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	var token = PrimitiveLiteral.int32Value(value, index);
	if (!token) return;
	index = token.next;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Skip);
}

export function top(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24top')){
		index += 6;
	}else
	if (Utils.equals(value, index, '$top')){
		index += 4;
	}else return;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	var token = PrimitiveLiteral.int32Value(value, index);
	if (!token) return;
	index = token.next;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Top);
}

export function format(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24format')){
		index += 9;
	}else
	if (Utils.equals(value, index, '$format')){
		index += 7;
	}else return;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

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

export function inlinecount(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24count')){
		index += 8;
	}else
	if (Utils.equals(value, index, '$count')){
		index += 6;
	}else return;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	var token = PrimitiveLiteral.booleanValue(value, index);
	if (!token) return;
	index = token.next;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.InlineCount);
}

export function select(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24select')){
		index += 9;
	}else
	if (Utils.equals(value, index, '$select')){
		index += 7;
	}else return;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	var items = [];
	var token = selectItem(value, index);
	if (!token) return;
	while (token){
		items.push(token);
		index = token.next;

		var comma = Lexer.COMMA(value, index);
		if (comma){
			index = comma;
			token = selectItem(value, index);
			if (!token) return;
		}else break;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Select);
}

export function selectItem(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	var item;
	var op = allOperationsInSchema(value, index);
	var star = Lexer.STAR(value, index);
	if (op > index){
		item = { namespace: Utils.stringify(value, index, op - 2), value: '*' };
		index = op;
	}else if (star){
		item = { value: '*' };
		index = star;
	}else{
		item = {};
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

export function allOperationsInSchema(value:number[] | Uint8Array, index:number):number {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	var star = Lexer.STAR(value, namespaceNext + 1);
	if (namespaceNext > index && value[namespaceNext] == 0x2e && star) return star;
	return index;
}

export function selectProperty(value:number[] | Uint8Array, index:number):Lexer.Token {
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

export function selectPath(value:number[] | Uint8Array, index:number):Lexer.Token {
	var token = NameOrIdentifier.complexProperty(value, index) ||
		NameOrIdentifier.complexColProperty(value, index);

	if (!token) return;
	var start = index;
	index = token.next;

	var tokenValue:any = token;
	if (value[index] == 0x2f){
		var name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1);
		if (name){
			index = name.next;
			tokenValue = { prop: token, name };
		}
	}

	return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.SelectPath);
}

export function qualifiedActionName(value:number[] | Uint8Array, index:number):Lexer.Token {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var start = index;
	index = namespaceNext + 1;

	var action = NameOrIdentifier.action(value, index);
	if (!action) return;

	return Lexer.tokenize(value, start, action.next, action, Lexer.TokenType.Action);
}

export function qualifiedFunctionName(value:number[] | Uint8Array, index:number):Lexer.Token {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var start = index;
	index = namespaceNext + 1;

	var fn = NameOrIdentifier.odataFunction(value, index);
	if (!fn) return;
	index = fn.next;
	var tokenValue:any = { name: fn };

	var open = Lexer.OPEN(value, index);
	if (open){
		index = open;
		tokenValue.parameters = [];
		var param = Expressions.parameterName(value, index);
		if (!param) return;

		while (param){
			index = param.next;
			tokenValue.parameters.push(param);

			var comma = Lexer.COMMA(value, index);
			if (comma){
				index = comma;
				var param = Expressions.parameterName(value, index);
				if (!param) return;
			}else break;
		}

		var close = Lexer.CLOSE(value, index);
		if (!close) return;
		index = close;
	}

	return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.Function);
}

export function skiptoken(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Utils.equals(value, index, '%24skiptoken')){
		index += 12;
	}else
	if (Utils.equals(value, index, '$skiptoken')){
		index += 10;
	}else return;
	
	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;
	
	var ch = Lexer.qcharNoAMP(value, index);
	if (!ch) return;
	var valueStart = index;
	
	while (ch > index){
		index = ch;
		ch = Lexer.qcharNoAMP(value, index);
	}
	
	return Lexer.tokenize(value, start, index, Utils.stringify(value, valueStart, index), Lexer.TokenType.SkipToken);
}

export function aliasAndValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var alias = Expressions.parameterAlias(value, index);
	if (!alias) return;
	var start = index;
	index = alias.next;

	var eq = Lexer.EQ(value, index);
	if (!eq) return;
	index = eq;

	var paramValue = Expressions.parameterValue(value, index);
	if (!paramValue) return;
	index = paramValue.next;

	return Lexer.tokenize(value, start, index, {
		alias,
		value: paramValue
	}, Lexer.TokenType.AliasAndValue);
}

//TODO: customQueryOption
