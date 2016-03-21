import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as ArrayOrObject from './json';
import { Edm } from 'odata-metadata';

export function commonExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var token = PrimitiveLiteral.primitiveLiteral(value, index) ||
		parameterAlias(value, index) ||
		ArrayOrObject.arrayOrObject(value, index, metadata) ||
		rootExpr(value, index, metadata) ||
		methodCallExpr(value, index, metadata) ||
		firstMemberExpr(value, index, metadata) ||
		functionExpr(value, index, metadata) ||
		negateExpr(value, index, metadata) ||
		parenExpr(value, index, metadata) ||
		castExpr(value, index, metadata);

	if (!token) return;

	var expr = addExpr(value, token.next, metadata) ||
		subExpr(value, token.next, metadata) ||
		mulExpr(value, token.next, metadata) ||
		divExpr(value, token.next, metadata) ||
		modExpr(value, token.next, metadata);

	if (expr) {
		token.value = {
			left: Lexer.clone(token),
			right: expr.value
		};
		token.next = expr.value.next;
		token.type = expr.type;
		token.raw = Utils.stringify(value, token.position, token.next);
	}

	if (token) return Lexer.tokenize(value, token.position, token.next, token, Lexer.TokenType.CommonExpression);
};

export function boolCommonExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var token = isofExpr(value, index, metadata) ||
		boolMethodCallExpr(value, index, metadata) ||
		notExpr(value, index, metadata) ||
		commonExpr(value, index, metadata) ||
		boolParenExpr(value, index, metadata);

	if (!token) return;

	var commonMoreExpr = undefined;
	if (token.type == Lexer.TokenType.CommonExpression) {
		commonMoreExpr = eqExpr(value, token.next, metadata) ||
		neExpr(value, token.next, metadata) ||
		ltExpr(value, token.next, metadata) ||
		leExpr(value, token.next, metadata) ||
		gtExpr(value, token.next, metadata) ||
		geExpr(value, token.next, metadata) ||
		hasExpr(value, token.next, metadata);

		if (commonMoreExpr) {
			token.value = {
				left: token.value,
				right: commonMoreExpr.value
			};
			token.next = commonMoreExpr.value.next;
			token.type = commonMoreExpr.type;
			token.raw = Utils.stringify(value, token.position, token.next);
		}
	}

	var expr = andExpr(value, token.next, metadata) ||
		orExpr(value, token.next, metadata);

	if (expr) {
		token.next = expr.value.next;
		token.value = {
			left: Lexer.clone(token),
			right: expr.value
		};
		token.type = expr.type;
		token.raw = Utils.stringify(value, token.position, token.next);
	}

	return token;
};

export function andExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var rws = Lexer.RWS(value, index);
	if (rws == index || !Utils.equals(value, rws, 'and')) return;
	var start = index;
	index = rws + 3;
	rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = boolCommonExpr(value, index, metadata);
	if (!token) return;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.AndExpression);
};

export function orExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var rws = Lexer.RWS(value, index);
	if (rws == index || !Utils.equals(value, rws, 'or')) return;
	var start = index;
	index = rws + 2;
	rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = boolCommonExpr(value, index, metadata);
	if (!token) return;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.OrExpression);
};

export function leftRightExpr(value:number[] | Uint8Array, index:number, expr:string, tokenType:Lexer.TokenType, metadata:Edm.Edmx):Lexer.Token {
	var rws = Lexer.RWS(value, index);
	if (rws == index) return;
	var start = index;
	index = rws;
	if (!Utils.equals(value, index, expr)) return;
	index += expr.length;
	rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = commonExpr(value, index, metadata);
	if (!token) return;

	return Lexer.tokenize(value, start, index, token.value, tokenType);
};
export function eqExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'eq', Lexer.TokenType.EqualsExpression, metadata); }
export function neExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'ne', Lexer.TokenType.NotEqualsExpression, metadata); }
export function ltExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'lt', Lexer.TokenType.LesserThanExpression, metadata); }
export function leExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'le', Lexer.TokenType.LesserOrEqualsExpression, metadata); }
export function gtExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'gt', Lexer.TokenType.GreaterThanExpression, metadata); }
export function geExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'ge', Lexer.TokenType.GreaterOrEqualsExpression, metadata); }
export function hasExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'has', Lexer.TokenType.HasExpression, metadata); }

export function addExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'add', Lexer.TokenType.AddExpression, metadata); }
export function subExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'sub', Lexer.TokenType.SubExpression, metadata); }
export function mulExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'mul', Lexer.TokenType.MulExpression, metadata); }
export function divExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'div', Lexer.TokenType.DivExpression, metadata); }
export function modExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return leftRightExpr(value, index, 'mod', Lexer.TokenType.ModExpression, metadata); }

export function notExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Utils.equals(value, index, 'not')) return;
	var start = index;
	index += 3;
	var rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = boolCommonExpr(value, index, metadata);
	if (!token) return;

	return Lexer.tokenize(value, start, token.next, token, Lexer.TokenType.NotExpression);
};

export function boolParenExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;
	index = Lexer.BWS(value, index);
	var token = boolCommonExpr(value, index, metadata);
	if (!token) return;
	index = Lexer.BWS(value, token.next);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.BoolParenExpression);
};
export function parenExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;
	index = Lexer.BWS(value, index);
	var token = commonExpr(value, index, metadata);
	if (!token) return;
	index = Lexer.BWS(value, token.next);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, token.value, Lexer.TokenType.ParenExpression);
};

export function boolMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	return endsWithMethodCallExpr(value, index, metadata) ||
		startsWithMethodCallExpr(value, index, metadata) ||
		containsMethodCallExpr(value, index, metadata) ||
		intersectsMethodCallExpr(value, index, metadata);
};
export function methodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	return indexOfMethodCallExpr(value, index, metadata) ||
		toLowerMethodCallExpr(value, index, metadata) ||
		toUpperMethodCallExpr(value, index, metadata) ||
		trimMethodCallExpr(value, index, metadata) ||
		substringMethodCallExpr(value, index, metadata) ||
		concatMethodCallExpr(value, index, metadata) ||
		lengthMethodCallExpr(value, index, metadata) ||
		yearMethodCallExpr(value, index, metadata) ||
		monthMethodCallExpr(value, index, metadata) ||
		dayMethodCallExpr(value, index, metadata) ||
		hourMethodCallExpr(value, index, metadata) ||
		minuteMethodCallExpr(value, index, metadata) ||
		secondMethodCallExpr(value, index, metadata) ||
		fractionalsecondsMethodCallExpr(value, index, metadata) ||
		totalsecondsMethodCallExpr(value, index, metadata) ||
		dateMethodCallExpr(value, index, metadata) ||
		timeMethodCallExpr(value, index, metadata) ||
		roundMethodCallExpr(value, index, metadata) ||
		floorMethodCallExpr(value, index, metadata) ||
		ceilingMethodCallExpr(value, index, metadata) ||
		distanceMethodCallExpr(value, index, metadata) ||
		geoLengthMethodCallExpr(value, index, metadata) ||
		totalOffsetMinutesMethodCallExpr(value, index, metadata) ||
		minDateTimeMethodCallExpr(value, index, metadata) ||
		maxDateTimeMethodCallExpr(value, index, metadata) ||
		nowMethodCallExpr(value, index, metadata);
};
export function methodCallExprFactory(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx, method:string, min?:number, max?:number):Lexer.Token {
	if (typeof min == 'undefined') min = 0;
	if (typeof max == 'undefined') max = min;

	if (!Utils.equals(value, index, method)) return;
	var start = index;
	index += method.length;
	if (!Lexer.OPEN(value[index])) return;
	index++;
	index = Lexer.BWS(value, index);
	var parameters;
	if (min > 0) {
		parameters = [];
		while (parameters.length < max) {
			var expr = commonExpr(value, index, metadata);
			if (parameters.length < min && !expr) return;
			else if (expr) {
				parameters.push(expr.value);
				index = expr.next;
				index = Lexer.BWS(value, index);
				if (parameters.length < min && !Lexer.COMMA(value[index])) return;
				if (Lexer.COMMA(value[index])) index++;
				else break;
				index = Lexer.BWS(value, index);
			} else break;
		}
	}
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		method: method,
		parameters: parameters
	}, Lexer.TokenType.MethodCallExpression);
};
export function containsMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'contains', 2); }
export function startsWithMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'startswith', 2); }
export function endsWithMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'endswith', 2); }
export function lengthMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'length', 1); }
export function indexOfMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'indexof', 2); }
export function substringMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'substring', 2, 3); }
export function toLowerMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'tolower', 1); }
export function toUpperMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'toupper', 1); }
export function trimMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'trim', 1); }
export function concatMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'concat', 2); }

export function yearMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'year', 1); }
export function monthMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'month', 1); }
export function dayMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'day', 1); }
export function hourMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'hour', 1); }
export function minuteMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'minute', 1); }
export function secondMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'second', 1); }
export function fractionalsecondsMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'fractionalseconds', 1); }
export function totalsecondsMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'totalseconds', 1); }
export function dateMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'date', 1); }
export function timeMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'time', 1); }
export function totalOffsetMinutesMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'totaloffsetminutes', 1); }

export function minDateTimeMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'mindatetime', 0); }
export function maxDateTimeMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'maxdatetime', 0); }
export function nowMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'now', 0); }

export function roundMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'round', 1); }
export function floorMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'floor', 1); }
export function ceilingMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'ceiling', 1); }

export function distanceMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'geo.distance', 2); }
export function geoLengthMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'geo.length', 1); }
export function intersectsMethodCallExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return methodCallExprFactory(value, index, metadata, 'geo.intersects', 2); }

export function isofExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Utils.equals(value, index, 'isof')) return;
	var start = index;
	index += 4;
	if (!Lexer.OPEN(value[index])) return;
	index++;
	index = Lexer.BWS(value, index);
	var expr = commonExpr(value, index, metadata);
	if (expr) {
		index = expr.next;
		index = Lexer.BWS(value, index);
		if (!Lexer.COMMA(value[index])) return;
		index++;
		index = Lexer.BWS(value, index);
	}
	var typeName = NameOrIdentifier.qualifiedTypeName(value, index, metadata);
	if (!typeName) return;
	index = typeName.next;
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		target: expr,
		typename: typeName
	}, Lexer.TokenType.IsOfExpression);
}
export function castExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Utils.equals(value, index, 'cast')) return;
	var start = index;
	index += 4;
	if (!Lexer.OPEN(value[index])) return;
	index++;
	index = Lexer.BWS(value, index);
	var expr = commonExpr(value, index, metadata);
	if (expr) {
		index = expr.next;
		index = Lexer.BWS(value, index);
		if (!Lexer.COMMA(value[index])) return;
		index++;
		index = Lexer.BWS(value, index);
	}
	var typeName = NameOrIdentifier.qualifiedTypeName(value, index, metadata);
	if (!typeName) return;
	index = typeName.next;
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		target: expr,
		typename: typeName
	}, Lexer.TokenType.CastExpression);
}

export function negateExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (value[index] != 0x2d) return;
	var start = index;
	index++;
	index = Lexer.BWS(value, index);
	var expr = commonExpr(value, index, metadata);
	if (!expr) return;

	return Lexer.tokenize(value, start, expr.next, expr, Lexer.TokenType.NegateExpression);
}

export function firstMemberExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var token = inscopeVariableExpr(value, index);
	var member;
	var start = index;

	if (token) {
		if (value[token.next] == 0x2f) {
			index = token.next + 1;
			member = memberExpr(value, index, metadata);
			if (!member) return;

			return Lexer.tokenize(value, start, member.next, [token, member], Lexer.TokenType.FirstMemberExpression);
		}
	} else member = memberExpr(value, index, metadata);

	token = token || member;
	if (!token) return;

	return Lexer.tokenize(value, start, token.next, token, Lexer.TokenType.FirstMemberExpression);
}
export function memberExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var start = index;
	var token = NameOrIdentifier.qualifiedEntityTypeName(value, index, metadata);

	if (token) {
		if (value[token.next] != 0x2f) return;
		index = token.next + 1;
	}

	var next = propertyPathExpr(value, index, metadata) ||
		boundFunctionExpr(value, index, metadata);

	if (!next) return;
	return Lexer.tokenize(value, start, next.next, token ? { name: token, value: next } : { value: next }, Lexer.TokenType.MemberExpression);
}
export function propertyPathExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	//var token = NameOrIdentifier.odataIdentifier(value, index);
	var token = NameOrIdentifier.entityColNavigationProperty(value, index, metadata) ||
		NameOrIdentifier.entityNavigationProperty(value, index, metadata) ||
		NameOrIdentifier.complexColProperty(value, index, metadata) ||
		NameOrIdentifier.complexProperty(value, index, metadata) ||
		NameOrIdentifier.primitiveColProperty(value, index, metadata) ||
		NameOrIdentifier.primitiveProperty(value, index, metadata);

	if (token){
		var nav = collectionPathExpr(value, token.next, metadata) ||
			collectionNavigationExpr(value, token.next, metadata) ||
			singleNavigationExpr(value, token.next, metadata) ||
			complexPathExpr(value, token.next, metadata) ||
			singlePathExpr(value, token.next, metadata);

		if (nav) {
			token.value = {
				current: Lexer.clone(token),
				next: nav
			};
			token.next = nav.next;
			token.raw = Utils.stringify(value, token.position, token.next);
		}
	} else token = token || NameOrIdentifier.streamProperty(value, index, metadata);

	if (!token) return;
	return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.PropertyPathExpression);
}
export function inscopeVariableExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	return implicitVariableExpr(value, index) ||
		(isLambdaPredicate ? lambdaVariableExpr(value, index) : undefined);
}
export function implicitVariableExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, '$it')) return Lexer.tokenize(value, index, index + 3, '$it', Lexer.TokenType.ImplicitVariableExpression);
}
var isLambdaPredicate = false;
var hasLambdaVariableExpr = false;
export function lambdaVariableExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	var token = NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.LambdaVariableExpression);
	if (token){
		hasLambdaVariableExpr = true;
		return token;
	}
}
export function lambdaPredicateExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	isLambdaPredicate = true;
	var token = boolCommonExpr(value, index, metadata);
	isLambdaPredicate = false;
	if (token && hasLambdaVariableExpr){
		hasLambdaVariableExpr = false;
		return Lexer.tokenize(value, token.position, token.next, token, Lexer.TokenType.LambdaPredicateExpression);
	}
}
export function anyExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Utils.equals(value, index, 'any')) return;
	var start = index;
	index += 3;
	if (!Lexer.OPEN(value[index])) return;
	index++
	index = Lexer.BWS(value, index);
	var variable = lambdaVariableExpr(value, index);
	var predicate;
	if (variable){
		index = variable.next;
		index = Lexer.BWS(value, index);
		if (!Lexer.COLON(value[index])) return;
		index++;
		index = Lexer.BWS(value, index);
		predicate = lambdaPredicateExpr(value, index, metadata);
		if (!predicate) return;
		index = predicate.next;
	}
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		variable: variable,
		predicate: predicate
	}, Lexer.TokenType.AnyExpression);
}
export function allExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Utils.equals(value, index, 'all')) return;
	var start = index;
	index += 3;
	if (!Lexer.OPEN(value[index])) return;
	index++
	index = Lexer.BWS(value, index);
	var variable = lambdaVariableExpr(value, index);
	if (!variable) return;
	index = variable.next;
	index = Lexer.BWS(value, index);
	if (!Lexer.COLON(value[index])) return;
	index++;
	index = Lexer.BWS(value, index);
	var predicate = lambdaPredicateExpr(value, index, metadata);
	if (!predicate) return;
	index = predicate.next;
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		variable: variable,
		predicate: predicate
	}, Lexer.TokenType.AllExpression);
}

export function collectionNavigationExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var start = index;
	var entity, predicate, navigation, path;
	if (value[index] == 0x2f){
		index++;
		entity = NameOrIdentifier.qualifiedEntityTypeName(value, index, metadata);
		if (!entity) return;
		index = entity.next;
	}

	predicate = keyPredicate(value, index, metadata);

	if (predicate){
		navigation = singleNavigationExpr(value, index, metadata);
	}else{
		path = collectionPathExpr(value, index, metadata);
	}

	if (index > start){
		return Lexer.tokenize(value, start, index, {
			entity: entity,
			predicate: predicate,
			navigation: navigation,
			path: path
		}, Lexer.TokenType.CollectionNavigationExpression);
	}
}
export function keyPredicate(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	return simpleKey(value, index) ||
		compoundKey(value, index, metadata);
}
export function simpleKey(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;

	var key = keyPropertyValue(value, index);
	if (!key || !Lexer.CLOSE(value[key.next])) return;

	return Lexer.tokenize(value, start, key.next + 1, key, Lexer.TokenType.SimpleKey);
}
export function compoundKey(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;

	var pair = keyValuePair(value, index, metadata);
	if (!pair) return;

	var keys = [];
	while (pair){
		keys.push(pair);
		if (Lexer.COMMA(value[pair.next])) pair = keyValuePair(value, pair.next + 1, metadata);
		else pair = null;
	}

	index = keys[keys.length - 1].next;
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, keys, Lexer.TokenType.CompoundKey);
}
export function keyValuePair(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var prop = NameOrIdentifier.primitiveKeyProperty(value, index, metadata) ||
		keyPropertyAlias(value, index);

	if (!prop || !Lexer.EQ(value[prop.next])) return;

	var val = keyPropertyValue(value, prop.next + 1);
	if (val) return Lexer.tokenize(value, index, val.next, {
		key: prop,
		value: val
	}, Lexer.TokenType.KeyValuePair);
}
export function keyPropertyValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var token = PrimitiveLiteral.primitiveLiteral(value, index);
	if (token){
		token.type = Lexer.TokenType.KeyPropertyValue;
		return token;
	}
}
export function keyPropertyAlias(value:number[] | Uint8Array, index:number):Lexer.Token { return NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.KeyPropertyAlias); }

export function singleNavigationExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (value[index] != 0x2f) return;
	var member = memberExpr(value, index + 1, metadata);
	if (member) return Lexer.tokenize(value, index, member.next, member, Lexer.TokenType.SingleNavigationExpression);
}
export function collectionPathExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var token = countExpr(value, index);
	if (!token) {
		if (value[index] == 0x2f) {
			token = boundFunctionExpr(value, index + 1, metadata) ||
			anyExpr(value, index + 1, metadata) ||
			allExpr(value, index + 1, metadata);
		}
	}

	if (token) return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.CollectionPathExpression);
}
export function complexPathExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (value[index] != 0x2f) return;
	var start = index;
	index++;
	var token = NameOrIdentifier.qualifiedComplexTypeName(value, index);
	if (token) {
		if (value[token.next] != 0x2f) return;
		index = token.next + 1;
	}

	var expr = propertyPathExpr(value, index, metadata) ||
		boundFunctionExpr(value, index, metadata);

	if (expr) return Lexer.tokenize(value, start, expr.next, token ? [token, expr] : [expr], Lexer.TokenType.ComplexPathExpression);
}
export function singlePathExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (value[index] != 0x2f) return;
	var boundFunction = boundFunctionExpr(value, index + 1, metadata);
	if (boundFunction) return Lexer.tokenize(value, index, boundFunction.next, boundFunction, Lexer.TokenType.SinglePathExpression);
}
export function functionExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var start = index;
	index = namespaceNext + 1;

	var token = NameOrIdentifier.odataIdentifier(value, index);

	if (!token) return;
	token.position = start;
	token.raw = Utils.stringify(value, start, token.next);

	index = token.next;
	var params = functionExprParameters(value, index, metadata);

	if (!params) return;

	index = params.next;
	var expr = collectionPathExpr(value, index, metadata) ||
		collectionNavigationExpr(value, index, metadata) ||
		singleNavigationExpr(value, index, metadata) ||
		complexPathExpr(value, index, metadata) ||
		singlePathExpr(value, index, metadata);

	if (expr) index = expr.next;

	return Lexer.tokenize(value, start, index, {
		fn: token,
		params: params,
		expression: expr
	}, Lexer.TokenType.FunctionExpression);
}
export function boundFunctionExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token { return functionExpr(value, index, metadata); }

export function functionExprParameters(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;

	var params = [];
	var expr = functionExprParameter(value, index, metadata);
	while (expr) {
		params.push(expr);
		if (Lexer.COMMA(expr.next)) {
			index = expr.next + 1;
			expr = functionExprParameter(value, index, metadata);
			if (!expr) return;
		} else {
			index = expr.next;
			expr = null;
		}
	}

	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, params, Lexer.TokenType.FunctionExpressionParameters);
}
export function functionExprParameter(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var name = parameterName(value, index);
	if (!name || !Lexer.EQ(value[name.next])) return;

	var start = index;
	index = name.next + 1;

	var param = parameterAlias(value, index) ||
		parameterValue(value, index, metadata);

	if (!param) return;
	return Lexer.tokenize(value, start, param.next, {
		name: name,
		value: param
	}, Lexer.TokenType.FunctionExpressionParameter);
}
export function parameterName(value:number[] | Uint8Array, index:number):Lexer.Token { return NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.ParameterName); }
export function parameterAlias(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Lexer.AT(value[index])) return;
	var id = NameOrIdentifier.odataIdentifier(value, index + 1);
	if (id) return Lexer.tokenize(value, index, id.next, id.value, Lexer.TokenType.ParameterAlias);
}
export function parameterValue(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	var token = ArrayOrObject.arrayOrObject(value, index, metadata) ||
		commonExpr(value, index, metadata);
	if (token) return Lexer.tokenize(value, index, token.next, token.value, Lexer.TokenType.ParameterValue);
}

export function countExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, '/$count')) return Lexer.tokenize(value, index, index + 7, '/$count', Lexer.TokenType.CountExpression);
}
export function refExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, '/$ref')) return Lexer.tokenize(value, index, index + 5, '/$ref', Lexer.TokenType.RefExpression);
}
export function valueExpr(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, '/$value')) return Lexer.tokenize(value, index, index + 7, '/$value', Lexer.TokenType.ValueExpression);
}

export function rootExpr(value:number[] | Uint8Array, index:number, metadata:Edm.Edmx):Lexer.Token {
	if (!Utils.equals(value, index, '$root/')) return;
	var start = index;
	index += 6;

	var entitySet = NameOrIdentifier.entitySetName(value, index);
	var predicate, entity, token;
	if (entitySet) predicate = keyPredicate(value, entitySet.next, metadata);
	if (!(entitySet && predicate)){
		entity = NameOrIdentifier.singletonEntity(value, index);
		if (!entity) return;
		token = {
			entity: entity
		};
	}else token = {
		entitySet: entitySet,
		keys: predicate
	}

	index = (predicate || entity).next;
	var nav = singleNavigationExpr(value, index, metadata);
	if (nav) index = nav.next;

	return Lexer.tokenize(value, start, index, {
		current: token,
		next: nav
	}, Lexer.TokenType.RootExpression);
}
