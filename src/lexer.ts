import * as Utils from './utils';

export class TokenType{
	static Literal = 'Literal'
	static ArrayOrObject = 'ArrayOrObject'
	static Array = 'Array'
	static Object = 'Object'
	static Property = 'Property'
	static Annotation = 'Annotation'
	static Enum = 'Enum'
	static EnumValue = 'EnumValue'
	static EnumMemberValue = 'EnumMemberValue'
	static Identifier = 'Identifier'
	static ODataIdentifier = 'ODataIdentifier'
	static Collection = 'Collection'
	static NamespacePart = 'NamespacePart'
	static EntitySetName = 'EntitySetName'
	static SingletonEntity = 'SingletonEntity'
	static EntityTypeName = 'EntityTypeName'
	static ComplexTypeName = 'ComplexTypeName'
	static TypeDefinitionName = 'TypeDefinitionName'
	static EnumerationTypeName = 'EnumerationTypeName'
	static EnumerationMember = 'EnumerationMember'
	static TermName = 'TermName'
	static PrimitiveProperty = 'PrimitiveProperty'
	static PrimitiveKeyProperty = 'PrimitiveKeyProperty'
	static PrimitiveNonKeyProperty = 'PrimitiveNonKeyProperty'
	static PrimitiveCollectionProperty = 'PrimitiveCollectionProperty'
	static ComplexProperty = 'ComplexProperty'
	static ComplexColProperty = 'ComplexColProperty'
	static StreamProperty = 'StreamProperty'
	static NavigationProperty = 'NavigationProperty'
	static EntityNavigationProperty = 'EntityNavigationProperty'
	static EntityCollectionNavigationProperty = 'EntityCollectionNavigationProperty'
	static Action = 'Action'
	static ActionImport = 'ActionImport'
	static Function = 'Function'
	static EntityFunction = 'EntityFunction'
	static EntityCollectionFunction = 'EntityCollectionFunction'
	static ComplexFunction = 'ComplexFunction'
	static ComplexCollectionFunction = 'ComplexCollectionFunction'
	static PrimitiveFunction = 'PrimitiveFunction'
	static PrimitiveCollectionFunction = 'PrimitiveCollectionFunction'
	static EntityFunctionImport = 'EntityFunctionImport'
	static EntityCollectionFunctionImport = 'EntityCollectionFunctionImport'
	static ComplexFunctionImport = 'ComplexFunctionImport'
	static ComplexCollectionFunctionImport = 'ComplexCollectionFunctionImport'
	static PrimitiveFunctionImport = 'PrimitiveFunctionImport'
	static PrimitiveCollectionFunctionImport = 'PrimitiveCollectionFunctionImport'
	static CommonExpression = 'CommonExpression'
	static AndExpression = 'AndExpression'
	static OrExpression = 'OrExpression'
	static EqualsExpression = 'EqualsExpression'
	static NotEqualsExpression = 'NotEqualsExpression'
	static LesserThanExpression = 'LesserThanExpression'
	static LesserOrEqualsExpression = 'LesserOrEqualsExpression'
	static GreaterThanExpression = 'GreaterThanExpression'
	static GreaterOrEqualsExpression = 'GreaterOrEqualsExpression'
	static HasExpression = 'HasExpression'
	static AddExpression = 'AddExpression'
	static SubExpression = 'SubExpression'
	static MulExpression = 'MulExpression'
	static DivExpression = 'DivExpression'
	static ModExpression = 'ModExpression'
	static NotExpression = 'NotExpression'
	static BoolParenExpression = 'BoolParenExpression'
	static ParenExpression = 'ParenExpression'
	static MethodCallExpression = 'MethodCallExpression'
	static IsOfExpression = 'IsOfExpression'
	static CastExpression = 'CastExpression'
	static NegateExpression = 'NegateExpression'
	static FirstMemberExpression = 'FirstMemberExpression'
	static MemberExpression = 'MemberExpression'
	static PropertyPathExpression = 'PropertyPathExpression'
	static ImplicitVariableExpression = 'ImplicitVariableExpression'
	static LambdaVariable = 'LambdaVariable'
	static LambdaVariableExpression = 'LambdaVariableExpression'
	static LambdaPredicateExpression = 'LambdaPredicateExpression'
	static AnyExpression = 'AnyExpression'
	static AllExpression = 'AllExpression'
	static CollectionNavigationExpression = 'CollectionNavigationExpression'
	static SimpleKey = 'SimpleKey'
	static CompoundKey = 'CompoundKey'
	static KeyValuePair = 'KeyValuePair'
	static KeyPropertyValue = 'KeyPropertyValue'
	static KeyPropertyAlias = 'KeyPropertyAlias'
	static SingleNavigationExpression = 'SingleNavigationExpression'
	static CollectionPathExpression = 'CollectionPathExpression'
	static ComplexPathExpression = 'ComplexPathExpression'
	static SinglePathExpression = 'SinglePathExpression'
	static FunctionExpression = 'FunctionExpression'
	static FunctionExpressionParameters = 'FunctionExpressionParameters'
	static FunctionExpressionParameter = 'FunctionExpressionParameter'
	static ParameterName = 'ParameterName'
	static ParameterAlias = 'ParameterAlias'
	static ParameterValue = 'ParameterValue'
	static CountExpression = 'CountExpression'
	static RefExpression = 'RefExpression'
	static ValueExpression = 'ValueExpression'
	static RootExpression = 'RootExpression'
}

export class Token{
	position:number
	next:number
	value:any
	type:TokenType
	raw:string
	constructor(token){
		this.position = token.position;
		this.next = token.next;
		this.value = token.value;
		this.type = token.type;
		this.raw = token.raw;
	}
}

export function tokenize(value:Array<number>, index:number, next:number, tokenValue:any, tokenType:TokenType):Token {
	return new Token({
		position: index,
		next: next,
		value: tokenValue,
		type: tokenType,
		raw: Utils.stringify(value, index, next)
	});
}

export function clone(token):Token {
	return new Token({
		position: token.position,
		next: token.next,
		value: token.value,
		type: token.type,
		raw: token.raw
	});
}

// core definitions
export function ALPHA(value:number):boolean { return (value >= 0x41 && value <= 0x5a) || (value >= 0x61 && value <= 0x7a); }
export function DIGIT(value:number):boolean { return (value >= 0x30 && value <= 0x39); }
export function HEXDIG(value:number):boolean { return DIGIT(value) || AtoF(value); }
export function AtoF(value:number):boolean { return (value >= 0x41 && value <= 0x46) || (value >= 0x61 && value <= 0x66); }
export function DQUOTE(value:number):boolean { return value == 0x22; }
export function SP(value:number):boolean { return value == 0x20; }
export function HTAB(value:number):boolean { return value == 0x09; }
export function VCHAR(value:number):boolean { return value >= 0x21 && value <= 0x7e; }

// punctuation
export function OWS(value:Array<number>, index:number):number {
	index = index || 0;
	while (SP(value[index]) || HTAB(value[index]) || value[index] == 0x20 || value[index] == 0x09) {
		index++;
	}
	return index;
}
export function RWS(value:Array<number>, index:number):number {
	return OWS(value, index);
}
export function BWS(value:Array<number>, index:number):number {
	return OWS(value, index);
}

export function AT(value:number):boolean { return value == 0x40; }
export function COLON(value:number):boolean { return value == 0x3a; }
export function COMMA(value:number):boolean { return value == 0x2c; }
export function EQ(value:number):boolean { return value == 0x3d; }
export function SIGN(value:number):boolean { return value == 0x2b || value == 0x2d; }
export function SEMI(value:number):boolean { return value == 0x3b; }
export function STAR(value:number):boolean { return value == 0x2a; }
export function SQUOTE(value:number):boolean { return value == 0x27; }
export function OPEN(value:number):boolean { return value == 0x28; }
export function CLOSE(value:number):boolean { return value == 0x29; }
// unreserved ALPHA / DIGIT / "-" / "." / "_" / "~"
export function unreserved(value:number):boolean { return ALPHA(value) || DIGIT(value) || value == 0x2d || value == 0x2e || value == 0x5f || value == 0x7e; }
// other-delims "!" /                   "(" / ")" / "*" / "+" / "," / ";"
export function otherDelims(value:number):boolean { return value == 0x21 || OPEN(value) || CLOSE(value) || STAR(value) || value == 0x2b || COMMA(value) || SEMI(value); }
// sub-delims     =       "$" / "&" / "'" /                                     "=" / other-delims
export function subDelims(value:number):boolean { return value == 0x24 || value == 0x26 || SQUOTE(value) || EQ(value) || otherDelims(value); }
export function pctEncoded(value:Array<number>, index:number):number {
	if (value[index] != 0x25 || !HEXDIG(value[index + 1]) || !HEXDIG(value[index + 2])) return index;
	return index + 3;
}
// pct-encoded-no-SQUOTE = "%" ( "0" / "1" /   "3" / "4" / "5" / "6" / "8" / "9" / A-to-F ) HEXDIG
//                       / "%" "2" ( "0" / "1" / "2" / "3" / "4" / "5" / "6" /   "8" / "9" / A-to-F )
export function pctEncodedNoSQUOTE(value:Array<number>, index:number):number {
	if (Utils.equals(value, index, '%27')) return index;
	return pctEncoded(value, index);
}
export function pchar(value:Array<number>, index:number):number {
	if (unreserved(value[index]) || subDelims(value[index]) || COLON(value[index]) || AT(value[index])) return index + 1;
	var encoded = pctEncoded(value, index);
	if (encoded > index) return encoded;
	return index;
}
export function pcharNoSQUOTE(value:Array<number>, index:number):number {
	if (unreserved(value[index]) || otherDelims(value[index]) || value[index] == 0x24 || value[index] == 0x26 || EQ(value[index]) || COLON(value[index]) || AT(value[index])) return index + 1;
	var encoded = pctEncodedNoSQUOTE(value, index);
	if (encoded > index) return encoded;
	return index;
}
//export function pchar(value:number):boolean { return unreserved(value) || otherDelims(value) || value == 0x24 || value == 0x26 || EQ(value) || COLON(value) || AT(value); }
export function base64char(value:number):boolean { return ALPHA(value) || DIGIT(value) || value == 0x2d || value == 0x5f; }
export function base64b16(value:Array<number>, index:number):number {
	var start = index;
	if (!base64char(value[index]) && !base64char(value[index + 1])) return start;
	index += 2;

	if (!Utils.is(value[index], 'AEIMQUYcgkosw048')) return start;
	index++;

	if (value[index] == 0x3d) index++;
	return index;
}
export function base64b8(value:Array<number>, index:number):number {
	var start = index;
	if (!base64char(value[index])) return start;
	index++;

	if (value[index] != 0x41 || value[index] != 0x51 || value[index] != 0x67 || value[index] != 0x77) return start;
	index++;

	if (value[index] == 0x3d && value[index + 1] == 0x3d) index += 2;
	return index;
}
export function nanInfinity(value:Array<number>, index:number):number {
	return Utils.equals(value, index, 'NaN') || Utils.equals(value, index, '-INF') || Utils.equals(value, index, 'INF');
}
export function oneToNine(value:number):boolean { return value != 0x30 && DIGIT(value); }
export function zeroToFiftyNine(value:Array<number>, index:number):number {
	if (value[index] >= 0x30 && value[index] <= 0x35 && DIGIT(value[index + 1])) return index + 2;
	return index;
}
export function year(value:Array<number>, index:number):number {
	var start = index;
	var end = index;
	if (value[index] == 0x2d) index++;
	if ((value[index] == 0x30 && (end = Utils.required(value, index + 1, DIGIT, 3, 3))) ||
		(oneToNine(value[index]) && (end = Utils.required(value, index + 1, DIGIT, 3)))) return end;
	return start;
}
export function month(value:Array<number>, index:number):number {
	if ((value[index] == 0x30 && oneToNine(value[index + 1])) ||
		(value[index] == 0x31 && value[index + 1] >= 0x30 && value[index + 1] <= 0x32)) return index + 2;
	return index;
}
export function day(value:Array<number>, index:number):number {
	if ((value[index] == 0x30 && oneToNine(value[index + 1])) ||
		((value[index] == 0x31 || value[index] == 0x32) && DIGIT(value[index + 1])) ||
		(value[index] == 0x33 && (value[index + 1] == 0x30 || value[index + 1] == 0x31))) return index + 2;
	return index;
}
export function hour(value:Array<number>, index:number):number {
	if (((value[index] == 0x30 || value[index] == 0x31) && DIGIT(value[index + 1])) ||
		(value[index] == 0x32 && (value[index + 1] == 0x31 || value[index + 1] == 0x32 || value[index + 1] == 0x33))) return index + 2;
	return index;
}
export function minute(value:Array<number>, index:number):number {
	return zeroToFiftyNine(value, index);
}
export function second(value:Array<number>, index:number):number {
	return zeroToFiftyNine(value, index);
}
export function fractionalSeconds(value:Array<number>, index:number):number {
	return Utils.required(value, index, DIGIT, 1, 12);
}
export function geographyPrefix(value:Array<number>, index:number):number {
	return Utils.equals(value, index, 'geography') ? index + 9 : index;
}
export function geometryPrefix(value:Array<number>, index:number):number {
	return Utils.equals(value, index, 'geometry') ? index + 8 : index;
}
export function identifierLeadingCharacter(value:number):boolean {
	return ALPHA(value) || value == 0x5f;
}
export function identifierCharacter(value:number):boolean {
	return identifierLeadingCharacter(value) || DIGIT(value);
}
export function beginObject(value:number[], index:number):number {
	var bws = BWS(value, index);
	var start = index;
	index = bws;
	if (Utils.equals(value, index, '{')) index++;
	else if (Utils.equals(value, index, '%7B')) index += 3;
	if (index == bws) return start;

	bws = BWS(value, index);
	return bws;
}
export function endObject(value:number[], index:number):number {
	var bws = BWS(value, index);
	var start = index;
	index = bws;
	if (Utils.equals(value, index, '}')) index++;
	else if (Utils.equals(value, index, '%7D')) index += 3;
	if (index == bws) return start;

	bws = BWS(value, index);
	return bws;
}
export function beginArray(value:number[], index:number):number {
	var bws = BWS(value, index);
	var start = index;
	index = bws;
	if (Utils.equals(value, index, '[')) index++;
	else if (Utils.equals(value, index, '%5B')) index += 3;
	if (index == bws) return start;

	bws = BWS(value, index);
	return bws;
}
export function endArray(value:number[], index:number):number {
	var bws = BWS(value, index);
	var start = index;
	index = bws;
	if (Utils.equals(value, index, ']')) index++;
	else if (Utils.equals(value, index, '%5D')) index += 3;
	if (index == bws) return start;

	bws = BWS(value, index);
	return bws;
}
export function quotationMark(value:number[], index:number):number {
	if (DQUOTE(value[index])) return index + 1;
	if (Utils.equals(value, index, '%22')) return index + 3;
	return index;
}
export function nameSeparator(value:number[], index:number):number {
	var bws = BWS(value, index);
	var start = index;
	index = bws;
	if (!COLON(value[index])) return start;
	index++;
	bws = BWS(value, index);
	return bws;
}
export function valueSeparator(value:number[], index:number):number {
	var bws = BWS(value, index);
	var start = index;
	index = bws;
	if (!COMMA(value[index])) return start;
	index++;
	bws = BWS(value, index);
	return bws;
}
export function escape(value:number[], index:number):number {
	if (Utils.equals(value, index, '\\')) return index + 1;
	if (Utils.equals(value, index, '%5C')) return index + 3;
	return index;
}
