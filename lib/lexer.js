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
    TokenType.ComplexColProperty = 'ComplexColProperty';
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
//# sourceMappingURL=lexer.js.map