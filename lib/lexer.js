"use strict";
var Utils = require('./utils');
var TokenType = (function () {
    function TokenType() {
    }
    TokenType.Literal = 'Literal';
    TokenType.ArrayOrObject = 'ArrayOrObject';
    TokenType.Array = 'Array';
    TokenType.Object = 'Object';
    TokenType.Property = 'Property';
    TokenType.Annotation = 'Annotation';
    TokenType.Enum = 'Enum';
    TokenType.EnumValue = 'EnumValue';
    TokenType.EnumMemberValue = 'EnumMemberValue';
    TokenType.Identifier = 'Identifier';
    TokenType.QualifiedEntityTypeName = 'QualifiedEntityTypeName';
    TokenType.QualifiedComplexTypeName = 'QualifiedComplexTypeName';
    TokenType.ODataIdentifier = 'ODataIdentifier';
    TokenType.Collection = 'Collection';
    TokenType.NamespacePart = 'NamespacePart';
    TokenType.EntitySetName = 'EntitySetName';
    TokenType.SingletonEntity = 'SingletonEntity';
    TokenType.EntityTypeName = 'EntityTypeName';
    TokenType.ComplexTypeName = 'ComplexTypeName';
    TokenType.TypeDefinitionName = 'TypeDefinitionName';
    TokenType.EnumerationTypeName = 'EnumerationTypeName';
    TokenType.EnumerationMember = 'EnumerationMember';
    TokenType.TermName = 'TermName';
    TokenType.PrimitiveProperty = 'PrimitiveProperty';
    TokenType.PrimitiveKeyProperty = 'PrimitiveKeyProperty';
    TokenType.PrimitiveNonKeyProperty = 'PrimitiveNonKeyProperty';
    TokenType.PrimitiveCollectionProperty = 'PrimitiveCollectionProperty';
    TokenType.ComplexProperty = 'ComplexProperty';
    TokenType.ComplexCollectionProperty = 'ComplexCollectionProperty';
    TokenType.StreamProperty = 'StreamProperty';
    TokenType.NavigationProperty = 'NavigationProperty';
    TokenType.EntityNavigationProperty = 'EntityNavigationProperty';
    TokenType.EntityCollectionNavigationProperty = 'EntityCollectionNavigationProperty';
    TokenType.Action = 'Action';
    TokenType.ActionImport = 'ActionImport';
    TokenType.Function = 'Function';
    TokenType.EntityFunction = 'EntityFunction';
    TokenType.EntityCollectionFunction = 'EntityCollectionFunction';
    TokenType.ComplexFunction = 'ComplexFunction';
    TokenType.ComplexCollectionFunction = 'ComplexCollectionFunction';
    TokenType.PrimitiveFunction = 'PrimitiveFunction';
    TokenType.PrimitiveCollectionFunction = 'PrimitiveCollectionFunction';
    TokenType.EntityFunctionImport = 'EntityFunctionImport';
    TokenType.EntityCollectionFunctionImport = 'EntityCollectionFunctionImport';
    TokenType.ComplexFunctionImport = 'ComplexFunctionImport';
    TokenType.ComplexCollectionFunctionImport = 'ComplexCollectionFunctionImport';
    TokenType.PrimitiveFunctionImport = 'PrimitiveFunctionImport';
    TokenType.PrimitiveCollectionFunctionImport = 'PrimitiveCollectionFunctionImport';
    TokenType.CommonExpression = 'CommonExpression';
    TokenType.AndExpression = 'AndExpression';
    TokenType.OrExpression = 'OrExpression';
    TokenType.EqualsExpression = 'EqualsExpression';
    TokenType.NotEqualsExpression = 'NotEqualsExpression';
    TokenType.LesserThanExpression = 'LesserThanExpression';
    TokenType.LesserOrEqualsExpression = 'LesserOrEqualsExpression';
    TokenType.GreaterThanExpression = 'GreaterThanExpression';
    TokenType.GreaterOrEqualsExpression = 'GreaterOrEqualsExpression';
    TokenType.HasExpression = 'HasExpression';
    TokenType.AddExpression = 'AddExpression';
    TokenType.SubExpression = 'SubExpression';
    TokenType.MulExpression = 'MulExpression';
    TokenType.DivExpression = 'DivExpression';
    TokenType.ModExpression = 'ModExpression';
    TokenType.NotExpression = 'NotExpression';
    TokenType.BoolParenExpression = 'BoolParenExpression';
    TokenType.ParenExpression = 'ParenExpression';
    TokenType.MethodCallExpression = 'MethodCallExpression';
    TokenType.IsOfExpression = 'IsOfExpression';
    TokenType.CastExpression = 'CastExpression';
    TokenType.NegateExpression = 'NegateExpression';
    TokenType.FirstMemberExpression = 'FirstMemberExpression';
    TokenType.MemberExpression = 'MemberExpression';
    TokenType.PropertyPathExpression = 'PropertyPathExpression';
    TokenType.ImplicitVariableExpression = 'ImplicitVariableExpression';
    TokenType.LambdaVariable = 'LambdaVariable';
    TokenType.LambdaVariableExpression = 'LambdaVariableExpression';
    TokenType.LambdaPredicateExpression = 'LambdaPredicateExpression';
    TokenType.AnyExpression = 'AnyExpression';
    TokenType.AllExpression = 'AllExpression';
    TokenType.CollectionNavigationExpression = 'CollectionNavigationExpression';
    TokenType.SimpleKey = 'SimpleKey';
    TokenType.CompoundKey = 'CompoundKey';
    TokenType.KeyValuePair = 'KeyValuePair';
    TokenType.KeyPropertyValue = 'KeyPropertyValue';
    TokenType.KeyPropertyAlias = 'KeyPropertyAlias';
    TokenType.SingleNavigationExpression = 'SingleNavigationExpression';
    TokenType.CollectionPathExpression = 'CollectionPathExpression';
    TokenType.ComplexPathExpression = 'ComplexPathExpression';
    TokenType.SinglePathExpression = 'SinglePathExpression';
    TokenType.FunctionExpression = 'FunctionExpression';
    TokenType.FunctionExpressionParameters = 'FunctionExpressionParameters';
    TokenType.FunctionExpressionParameter = 'FunctionExpressionParameter';
    TokenType.ParameterName = 'ParameterName';
    TokenType.ParameterAlias = 'ParameterAlias';
    TokenType.ParameterValue = 'ParameterValue';
    TokenType.CountExpression = 'CountExpression';
    TokenType.RefExpression = 'RefExpression';
    TokenType.ValueExpression = 'ValueExpression';
    TokenType.RootExpression = 'RootExpression';
    TokenType.QueryOptions = 'QueryOptions';
    TokenType.Expand = 'Expand';
    TokenType.ExpandItem = 'ExpandItem';
    TokenType.ExpandPath = 'ExpandPath';
    TokenType.ExpandCountOption = 'ExpandCountOption';
    TokenType.ExpandRefOption = 'ExpandRefOption';
    TokenType.ExpandOption = 'ExpandOption';
    TokenType.Levels = 'Levels';
    TokenType.Search = 'Search';
    TokenType.SearchExpression = 'SearchExpression';
    TokenType.SearchParenExpression = 'SearchParenExpression';
    TokenType.SearchNotExpression = 'SearchNotExpression';
    TokenType.SearchOrExpression = 'SearchOrExpression';
    TokenType.SearchAndExpression = 'SearchAndExpression';
    TokenType.SearchTerm = 'SearchTerm';
    TokenType.SearchPhrase = 'SearchPhrase';
    TokenType.SearchWord = 'SearchWord';
    TokenType.Filter = 'Filter';
    TokenType.OrderBy = 'OrderBy';
    TokenType.OrderByItem = 'OrderByItem';
    TokenType.Skip = 'Skip';
    TokenType.Top = 'Top';
    TokenType.Format = 'Format';
    TokenType.InlineCount = 'InlineCount';
    TokenType.Select = 'Select';
    TokenType.SelectItem = 'SelectItem';
    TokenType.SelectPath = 'SelectPath';
    TokenType.AliasAndValue = 'AliasAndValue';
    TokenType.SkipToken = 'SkipToken';
    TokenType.Crossjoin = 'Crossjoin';
    TokenType.AllResource = 'AllResource';
    TokenType.ActionImportCall = 'ActionImportCall';
    TokenType.FunctionImportCall = 'FunctionImportCall';
    TokenType.EntityCollectionFunctionImportCall = 'EntityCollectionFunctionImportCall';
    TokenType.EntityFunctionImportCall = 'EntityFunctionImportCall';
    TokenType.ComplexCollectionFunctionImportCall = 'ComplexCollectionFunctionImportCall';
    TokenType.ComplexFunctionImportCall = 'ComplexFunctionImportCall';
    TokenType.PrimitiveCollectionFunctionImportCall = 'PrimitiveCollectionFunctionImportCall';
    TokenType.PrimitiveFunctionImportCall = 'PrimitiveFunctionImportCall';
    TokenType.FunctionParameters = 'FunctionParameters';
    TokenType.FunctionParameter = 'FunctionParameter';
    TokenType.ResourcePath = 'ResourcePath';
    TokenType.CollectionNavigation = 'CollectionNavigation';
    TokenType.CollectionNavigationPath = 'CollectionNavigationPath';
    TokenType.SingleNavigation = 'SingleNavigation';
    TokenType.PropertyPath = 'PropertyPath';
    TokenType.ComplexPath = 'ComplexPath';
    TokenType.BoundOperation = 'BoundOperation';
    TokenType.BoundActionCall = 'BoundActionCall';
    TokenType.BoundEntityFunctionCall = 'BoundEntityFunctionCall';
    TokenType.BoundEntityCollectionFunctionCall = 'BoundEntityCollectionFunctionCall';
    TokenType.BoundComplexFunctionCall = 'BoundComplexFunctionCall';
    TokenType.BoundComplexCollectionFunctionCall = 'BoundComplexCollectionFunctionCall';
    TokenType.BoundPrimitiveFunctionCall = 'BoundPrimitiveFunctionCall';
    TokenType.BoundPrimitiveCollectionFunctionCall = 'BoundPrimitiveCollectionFunctionCall';
    TokenType.ODataUri = 'ODataUri';
    TokenType.Batch = 'Batch';
    TokenType.Entity = 'Entity';
    TokenType.Metadata = 'Metadata';
    return TokenType;
}());
exports.TokenType = TokenType;
var Token = (function () {
    function Token(token) {
        this.position = token.position;
        this.next = token.next;
        this.value = token.value;
        this.type = token.type;
        this.raw = token.raw;
    }
    return Token;
}());
exports.Token = Token;
function tokenize(value, index, next, tokenValue, tokenType) {
    return new Token({
        position: index,
        next: next,
        value: tokenValue,
        type: tokenType,
        raw: Utils.stringify(value, index, next)
    });
}
exports.tokenize = tokenize;
function clone(token) {
    return new Token({
        position: token.position,
        next: token.next,
        value: token.value,
        type: token.type,
        raw: token.raw
    });
}
exports.clone = clone;
// core definitions
function ALPHA(value) { return (value >= 0x41 && value <= 0x5a) || (value >= 0x61 && value <= 0x7a); }
exports.ALPHA = ALPHA;
function DIGIT(value) { return (value >= 0x30 && value <= 0x39); }
exports.DIGIT = DIGIT;
function HEXDIG(value) { return DIGIT(value) || AtoF(value); }
exports.HEXDIG = HEXDIG;
function AtoF(value) { return (value >= 0x41 && value <= 0x46) || (value >= 0x61 && value <= 0x66); }
exports.AtoF = AtoF;
function DQUOTE(value) { return value == 0x22; }
exports.DQUOTE = DQUOTE;
function SP(value) { return value == 0x20; }
exports.SP = SP;
function HTAB(value) { return value == 0x09; }
exports.HTAB = HTAB;
function VCHAR(value) { return value >= 0x21 && value <= 0x7e; }
exports.VCHAR = VCHAR;
// punctuation
function whitespaceLength(value, index) {
    if (Utils.equals(value, index, '%20') || Utils.equals(value, index, '%09'))
        return 3;
    else if (SP(value[index]) || HTAB(value[index]) || value[index] == 0x20 || value[index] == 0x09)
        return 1;
}
function OWS(value, index) {
    index = index || 0;
    var inc = whitespaceLength(value, index);
    while (inc) {
        index += inc;
        inc = whitespaceLength(value, index);
    }
    return index;
}
exports.OWS = OWS;
function RWS(value, index) {
    return OWS(value, index);
}
exports.RWS = RWS;
function BWS(value, index) {
    return OWS(value, index);
}
exports.BWS = BWS;
function AT(value, index) {
    if (value[index] == 0x40)
        return index + 1;
    else if (Utils.equals(value, index, '%40'))
        return index + 3;
}
exports.AT = AT;
function COLON(value, index) {
    if (value[index] == 0x3a)
        return index + 1;
    else if (Utils.equals(value, index, '%3A'))
        return index + 3;
}
exports.COLON = COLON;
function COMMA(value, index) {
    if (value[index] == 0x2c)
        return index + 1;
    else if (Utils.equals(value, index, '%2C'))
        return index + 3;
}
exports.COMMA = COMMA;
function EQ(value, index) {
    if (value[index] == 0x3d)
        return index + 1;
}
exports.EQ = EQ;
function SIGN(value, index) {
    if (value[index] == 0x2b || value[index] == 0x2d)
        return index + 1;
    else if (Utils.equals(value, index, '%2B'))
        return index + 3;
}
exports.SIGN = SIGN;
function SEMI(value, index) {
    if (value[index] == 0x3b)
        return index + 1;
    else if (Utils.equals(value, index, '%3B'))
        return index + 3;
}
exports.SEMI = SEMI;
function STAR(value, index) {
    if (value[index] == 0x2a)
        return index + 1;
    else if (Utils.equals(value, index, '%2A'))
        return index + 3;
}
exports.STAR = STAR;
function SQUOTE(value, index) {
    if (value[index] == 0x27)
        return index + 1;
    else if (Utils.equals(value, index, '%27'))
        return index + 3;
}
exports.SQUOTE = SQUOTE;
function OPEN(value, index) {
    if (value[index] == 0x28)
        return index + 1;
    else if (Utils.equals(value, index, '%28'))
        return index + 3;
}
exports.OPEN = OPEN;
function CLOSE(value, index) {
    if (value[index] == 0x29)
        return index + 1;
    else if (Utils.equals(value, index, '%29'))
        return index + 3;
}
exports.CLOSE = CLOSE;
// unreserved ALPHA / DIGIT / "-" / "." / "_" / "~"
function unreserved(value) { return ALPHA(value) || DIGIT(value) || value == 0x2d || value == 0x2e || value == 0x5f || value == 0x7e; }
exports.unreserved = unreserved;
// other-delims "!" /                   "(" / ")" / "*" / "+" / "," / ";"
function otherDelims(value, index) {
    if (value[index] == 0x21 || value[index] == 0x2b)
        return index + 1;
    else
        return OPEN(value, index) || CLOSE(value, index) || STAR(value, index) || COMMA(value, index) || SEMI(value, index);
}
exports.otherDelims = otherDelims;
// sub-delims     =       "$" / "&" / "'" /                                     "=" / other-delims
function subDelims(value, index) {
    if (value[index] == 0x24 || value[index] == 0x26)
        return index + 1;
    else
        return SQUOTE(value, index) || EQ(value, index) || otherDelims(value, index);
}
exports.subDelims = subDelims;
function pctEncoded(value, index) {
    if (value[index] != 0x25 || !HEXDIG(value[index + 1]) || !HEXDIG(value[index + 2]))
        return index;
    return index + 3;
}
exports.pctEncoded = pctEncoded;
// pct-encoded-no-SQUOTE = "%" ( "0" / "1" /   "3" / "4" / "5" / "6" / "8" / "9" / A-to-F ) HEXDIG
//                       / "%" "2" ( "0" / "1" / "2" / "3" / "4" / "5" / "6" /   "8" / "9" / A-to-F )
function pctEncodedNoSQUOTE(value, index) {
    if (Utils.equals(value, index, '%27'))
        return index;
    return pctEncoded(value, index);
}
exports.pctEncodedNoSQUOTE = pctEncodedNoSQUOTE;
function pctEncodedUnescaped(value, index) {
    if (Utils.equals(value, index, '%22') ||
        Utils.equals(value, index, '%3') ||
        Utils.equals(value, index, '%4') ||
        Utils.equals(value, index, '%5C'))
        return index;
    return pctEncoded(value, index);
}
exports.pctEncodedUnescaped = pctEncodedUnescaped;
function pchar(value, index) {
    if (unreserved(value[index]))
        return index + 1;
    else
        return subDelims(value, index) || COLON(value, index) || AT(value, index) || pctEncoded(value, index) || index;
}
exports.pchar = pchar;
function pcharNoSQUOTE(value, index) {
    if (unreserved(value[index]) || value[index] == 0x24 || value[index] == 0x26)
        return index + 1;
    else
        return otherDelims(value, index) || EQ(value, index) || COLON(value, index) || AT(value, index) || pctEncodedNoSQUOTE(value, index) || index;
}
exports.pcharNoSQUOTE = pcharNoSQUOTE;
function qcharNoAMP(value, index) {
    if (unreserved(value[index]) || value[index] == 0x3a || value[index] == 0x40 || value[index] == 0x2f || value[index] == 0x3f || value[index] == 0x24 || value[index] == 0x27 || value[index] == 0x3d)
        return index + 1;
    else
        return pctEncoded(value, index) || otherDelims(value, index) || index;
}
exports.qcharNoAMP = qcharNoAMP;
function qcharNoAMPDQUOTE(value, index) {
    if (unreserved(value[index]) || value[index] == 0x3a || value[index] == 0x40 || value[index] == 0x2f || value[index] == 0x3f || value[index] == 0x24 || value[index] == 0x27 || value[index] == 0x3d)
        return index + 1;
    else
        return otherDelims(value, index) || pctEncodedUnescaped(value, index);
}
exports.qcharNoAMPDQUOTE = qcharNoAMPDQUOTE;
//export function pchar(value:number):boolean { return unreserved(value) || otherDelims(value) || value == 0x24 || value == 0x26 || EQ(value) || COLON(value) || AT(value); }
function base64char(value) { return ALPHA(value) || DIGIT(value) || value == 0x2d || value == 0x5f; }
exports.base64char = base64char;
function base64b16(value, index) {
    var start = index;
    if (!base64char(value[index]) && !base64char(value[index + 1]))
        return start;
    index += 2;
    if (!Utils.is(value[index], 'AEIMQUYcgkosw048'))
        return start;
    index++;
    if (value[index] == 0x3d)
        index++;
    return index;
}
exports.base64b16 = base64b16;
function base64b8(value, index) {
    var start = index;
    if (!base64char(value[index]))
        return start;
    index++;
    if (value[index] != 0x41 || value[index] != 0x51 || value[index] != 0x67 || value[index] != 0x77)
        return start;
    index++;
    if (value[index] == 0x3d && value[index + 1] == 0x3d)
        index += 2;
    return index;
}
exports.base64b8 = base64b8;
function nanInfinity(value, index) {
    return Utils.equals(value, index, 'NaN') || Utils.equals(value, index, '-INF') || Utils.equals(value, index, 'INF');
}
exports.nanInfinity = nanInfinity;
function oneToNine(value) { return value != 0x30 && DIGIT(value); }
exports.oneToNine = oneToNine;
function zeroToFiftyNine(value, index) {
    if (value[index] >= 0x30 && value[index] <= 0x35 && DIGIT(value[index + 1]))
        return index + 2;
    return index;
}
exports.zeroToFiftyNine = zeroToFiftyNine;
function year(value, index) {
    var start = index;
    var end = index;
    if (value[index] == 0x2d)
        index++;
    if ((value[index] == 0x30 && (end = Utils.required(value, index + 1, DIGIT, 3, 3))) ||
        (oneToNine(value[index]) && (end = Utils.required(value, index + 1, DIGIT, 3))))
        return end;
    return start;
}
exports.year = year;
function month(value, index) {
    if ((value[index] == 0x30 && oneToNine(value[index + 1])) ||
        (value[index] == 0x31 && value[index + 1] >= 0x30 && value[index + 1] <= 0x32))
        return index + 2;
    return index;
}
exports.month = month;
function day(value, index) {
    if ((value[index] == 0x30 && oneToNine(value[index + 1])) ||
        ((value[index] == 0x31 || value[index] == 0x32) && DIGIT(value[index + 1])) ||
        (value[index] == 0x33 && (value[index + 1] == 0x30 || value[index + 1] == 0x31)))
        return index + 2;
    return index;
}
exports.day = day;
function hour(value, index) {
    if (((value[index] == 0x30 || value[index] == 0x31) && DIGIT(value[index + 1])) ||
        (value[index] == 0x32 && (value[index + 1] == 0x31 || value[index + 1] == 0x32 || value[index + 1] == 0x33)))
        return index + 2;
    return index;
}
exports.hour = hour;
function minute(value, index) {
    return zeroToFiftyNine(value, index);
}
exports.minute = minute;
function second(value, index) {
    return zeroToFiftyNine(value, index);
}
exports.second = second;
function fractionalSeconds(value, index) {
    return Utils.required(value, index, DIGIT, 1, 12);
}
exports.fractionalSeconds = fractionalSeconds;
function geographyPrefix(value, index) {
    return Utils.equals(value, index, 'geography') ? index + 9 : index;
}
exports.geographyPrefix = geographyPrefix;
function geometryPrefix(value, index) {
    return Utils.equals(value, index, 'geometry') ? index + 8 : index;
}
exports.geometryPrefix = geometryPrefix;
function identifierLeadingCharacter(value) {
    return ALPHA(value) || value == 0x5f;
}
exports.identifierLeadingCharacter = identifierLeadingCharacter;
function identifierCharacter(value) {
    return identifierLeadingCharacter(value) || DIGIT(value);
}
exports.identifierCharacter = identifierCharacter;
function beginObject(value, index) {
    var bws = BWS(value, index);
    var start = index;
    index = bws;
    if (Utils.equals(value, index, '{'))
        index++;
    else if (Utils.equals(value, index, '%7B'))
        index += 3;
    if (index == bws)
        return start;
    bws = BWS(value, index);
    return bws;
}
exports.beginObject = beginObject;
function endObject(value, index) {
    var bws = BWS(value, index);
    var start = index;
    index = bws;
    if (Utils.equals(value, index, '}'))
        index++;
    else if (Utils.equals(value, index, '%7D'))
        index += 3;
    if (index == bws)
        return start;
    bws = BWS(value, index);
    return bws;
}
exports.endObject = endObject;
function beginArray(value, index) {
    var bws = BWS(value, index);
    var start = index;
    index = bws;
    if (Utils.equals(value, index, '['))
        index++;
    else if (Utils.equals(value, index, '%5B'))
        index += 3;
    if (index == bws)
        return start;
    bws = BWS(value, index);
    return bws;
}
exports.beginArray = beginArray;
function endArray(value, index) {
    var bws = BWS(value, index);
    var start = index;
    index = bws;
    if (Utils.equals(value, index, ']'))
        index++;
    else if (Utils.equals(value, index, '%5D'))
        index += 3;
    if (index == bws)
        return start;
    bws = BWS(value, index);
    return bws;
}
exports.endArray = endArray;
function quotationMark(value, index) {
    if (DQUOTE(value[index]))
        return index + 1;
    if (Utils.equals(value, index, '%22'))
        return index + 3;
    return index;
}
exports.quotationMark = quotationMark;
function nameSeparator(value, index) {
    var bws = BWS(value, index);
    var start = index;
    index = bws;
    var colon = COLON(value, index);
    if (!colon)
        return start;
    index = colon;
    bws = BWS(value, index);
    return bws;
}
exports.nameSeparator = nameSeparator;
function valueSeparator(value, index) {
    var bws = BWS(value, index);
    var start = index;
    index = bws;
    var comma = COMMA(value, index);
    if (!comma)
        return start;
    index = comma;
    bws = BWS(value, index);
    return bws;
}
exports.valueSeparator = valueSeparator;
function escape(value, index) {
    if (Utils.equals(value, index, '\\'))
        return index + 1;
    if (Utils.equals(value, index, '%5C'))
        return index + 3;
    return index;
}
exports.escape = escape;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDbEcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNkLENBQUM7QUFKZSxhQUFLLFFBSXBCLENBQUE7QUFDRCxhQUFvQixLQUEyQixFQUFFLEtBQVk7SUFDNUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0UsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDcEcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNkLENBQUM7QUFMZSxXQUFHLE1BS2xCLENBQUE7QUFDRCxjQUFxQixLQUEyQixFQUFFLEtBQVk7SUFDN0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMs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QztBQUNkLENBQUM7QUFKZSxxQkFBYSxnQkFJNUIsQ0FBQTtBQUNELHVCQUE4QixLQUEyQixFQUFFLEtBQVk7SUFDdEUsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUNaLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3pCLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDZCxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QixNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ1osQ0FBQztBQVRlLHFCQUFhLGdCQVM1QixDQUFBO0FBQ0Qsd0JBQStCLEtBQTJCLEVBQUUsS0FBWTtJQUN2RSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixLQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ1osSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDekIsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNkLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDWixDQUFDO0FBVGUsc0JBQWMsaUJBUzdCLENBQUE7QUFDRCxnQkFBdUIsS0FBMkIsRUFBRSxLQUFZO0lBQy9ELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDZCxDQUFDO0FBSmUsY0FBTSxTQUlyQixDQUFBIiwiZmlsZSI6ImxleGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL3NyYyJ9
