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
    TokenType.Id = 'Id';
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
        (value[index] == 0x32 && (value[index + 1] == 0x30 || value[index + 1] == 0x31 || value[index + 1] == 0x32 || value[index + 1] == 0x33)))
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUhlLFlBQUksT0FHbkIsQ0FBQTtBQUNELGdCQUF1QixLQUEyQixFQUFFLEtBQVk7SUFDL0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM5RCxDQUFDO0FBSGUsY0FBTSxTQUdyQixDQUFBO0FBQ0QsY0FBcUIsS0FBMkIsRUFBRSxLQUFZO0lBQzdELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUhlLFlBQUksT0FHbkIsQ0FBQTtBQUNELGVBQXNCLEtBQTJCLEVBQUUsS0FBWTtJQUM5RCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFD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LENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDZCxDQUFDO0FBSmUscUJBQWEsZ0JBSTVCLENBQUE7QUFDRCx1QkFBOEIsS0FBMkIsRUFBRSxLQUFZO0lBQ3RFLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDWixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN6QixLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2QsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNaLENBQUM7QUFUZSxxQkFBYSxnQkFTNUIsQ0FBQTtBQUNELHdCQUErQixLQUEyQixFQUFFLEtBQVk7SUFDdkUsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUNaLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3pCLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDZCxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QixNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ1osQ0FBQztBQVRlLHNCQUFjLGlCQVM3QixDQUFBO0FBQ0QsZ0JBQXVCLEtBQTJCLEVBQUUsS0FBWTtJQUMvRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUN2RCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUN4RCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2QsQ0FBQztBQUplLGNBQU0sU0FJckIsQ0FBQSIsImZpbGUiOiJsZXhlci5qcyIsInNvdXJjZVJvb3QiOiIuLi9zcmMifQ==
