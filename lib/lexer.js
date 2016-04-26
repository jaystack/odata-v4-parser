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
})();
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
})();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxleGVyLnRzIl0sIm5hbWVzIjpbIlRva2VuVHlwZSIsIlRva2VuVHlwZS5jb25zdHJ1Y3RvciIsIlRva2VuIiwiVG9rZW4uY29uc3RydWN0b3IiLCJ0b2tlbml6ZSIsImNsb25lIiwiQUxQSEEiLCJESUdJVCIsIkhFWERJRyIsIkF0b0YiLCJEUVVPVEUiLCJTUCIsIkhUQUIiLCJWQ0hBUiIsIndoaXRlc3BhY2VMZW5ndGgiLCJPV1MiLCJSV1MiLCJCV1MiLCJBVCIsIkNPTE9OIiwiQ09NTUEiLCJFUSIsIlNJR04iLCJTRU1JIiwiU1RBUiIsIlNRVU9URSIsIk9QRU4iLCJDTE9TRSIsInVucmVzZXJ2ZWQiLCJvdGhlckRlbGltcyIsInN1YkRlbGltcyIsInBjdEVuY29kZWQiLCJwY3RFbmNvZGVkTm9TUVVPVEUiLCJwY3RFbmNvZGVkVW5lc2NhcGVkIiwicGNoYXIiLCJwY2hhck5vU1FVT1RFIiwicWNoYXJOb0FNUCIsInFjaGFyTm9BTVBEUVVPVEUiLCJiYXNlNjRjaGFyIiwiYmFzZTY0YjE2IiwiYmFzZTY0YjgiLCJuYW5JbmZpbml0eSIsIm9uZVRvTmluZSIsInplcm9Ub0ZpZnR5TmluZSIsInllYXIiLCJtb250aCIsImRheSIsImhvdXIiLCJtaW51dGUiLCJzZWNvbmQiLCJmcmFjdGlvbmFsU2Vjb25kcyIsImdlb2dyYXBoeVByZWZpeCIsImdlb21ldHJ5UHJlZml4IiwiaWRlbnRpZmllckxlYWRpbmdDaGFyYWN0ZXIiLCJpZGVudGlmaWVyQ2hhcmFjdGVyIiwiYmVnaW5PYmplY3QiLCJlbmRPYmplY3QiLCJiZWdpbkFycmF5IiwiZW5kQXJyYXkiLCJxdW90YXRpb25NYXJrIiwibmFtZVNlcGFyYXRvciIsInZhbHVlU2VwYXJhdG9yIiwiZXNjYXBlIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUVqQztJQUFBQTtJQXVKQUMsQ0FBQ0E7SUF0Sk9ELGlCQUFPQSxHQUFHQSxTQUFTQSxDQUFBQTtJQUNuQkEs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Q0FBQ0EsQ0FBQ0E7QUFDMUJBLENBQUNBO0FBRmUsV0FBRyxNQUVsQixDQUFBO0FBRUQsWUFBbUIsS0FBMkIsRUFBRSxLQUFZO0lBQzNEQyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMzQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDOURBLENBQUNBO0FBSGUsVUFBRSxLQUdqQixDQUFBO0FBQ0QsZUFBc0IsS0FBMkIsRUFBRSxLQUFZO0lBQzlEQyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMzQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDOURBLENBQUNBO0FBSGUsYUFBSyxRQUdwQixDQUFBO0FBQ0QsZUFBc0IsS0FBMkIsRUFBRSxLQUFZO0lBQzlEQyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMzQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDOURBLENBQUNBO0FBSGUsYUFBSyxRQUdwQixDQUFBO0FBQ0QsWUFBbUIsS0FBMkIsRUFBRSxLQUFZO0lBQzNEQyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUM1Q0EsQ0FBQ0E7QUFGZSxVQUFFLEtBRWpCLENBQUE7QUFDRCxjQUFxQixLQUEyQixFQUFFLEtBQVk7SUFDN0RDLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQ25FQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUM5REEsQ0FBQ0E7QUFIZSxZQUFJLE9BR25CLENBQUE7QUFDRCxjQUFxQixLQUEyQixFQUFFLEtBQVk7SUFDN0RDLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQzNDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUM5REEsQ0FBQ0E7QUFIZSxZQUFJLE9BR25CLENBQUE7QUFDRCxjQUFxQixLQUEyQixFQUFFLEtBQVk7SUFDN0RDLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQzNDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUM5REEsQ0FBQ0E7QUFIZSxZQUFJLE9BR25CLENBQUE7QUFDRCxnQkFBdUIsS0FBMkIsRUFBRSxLQUFZO0lBQy9EQyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMzQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDOURBLENBQUNBO0FBSGUsY0FBTSxTQUdyQixDQUFBO0FBQ0QsY0FBcUIsS0FBMkIsRUFBRSxLQUFZO0lBQzdEQyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMzQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FB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QSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN2TkEsSUFBSUE7UUFBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsV0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0E7QUFDNUVBLENBQUNBO0FBSGUsa0JBQVUsYUFHekIsQ0FBQTtBQUNELDBCQUFpQyxLQUEyQixFQUFFLEtBQVk7SUFDekVDLEVBQUVBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3ZOQSxJQUFJQTtRQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxtQkFBbUJBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0FBQzVFQSxDQUFDQTtBQUhlLHdCQUFnQixtQkFHL0IsQ0FBQTtBQUNELDZLQUE2SztBQUM3SyxvQkFBMkIsS0FBWSxJQUFZQyxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUEzRyxrQkFBVSxhQUFpRyxDQUFBO0FBQzNILG1CQUEwQixLQUEyQixFQUFFLEtBQVk7SUFDbEVDLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUM3RUEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFFWEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBRUEsa0JBQWtCQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUM5REEsS0FBS0EsRUFBRUEsQ0FBQ0E7SUFFUkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0E7UUFBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7SUFDbENBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0FBQ2RBLENBQUNBO0FBVmUsaUJBQVMsWUFVeEIsQ0FBQTtBQUNELGtCQUF5QixLQUEyQixFQUFFLEtBQVk7SUFDakVDLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUM1Q0EsS0FBS0EsRUFBRUEsQ0FBQ0E7SUFFUkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDL0dBLEtBQUtBLEVBQUVBLENBQUNBO0lBRVJBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLENBQUNBO1FBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO0lBQ2pFQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtBQUNkQSxDQUFDQTtBQVZlLGdCQUFRLFdBVXZCLENBQUE7QUFDRCxxQkFBNEIsS0FBMkIsRUFBRSxLQUFZO0lBQ3BFQyxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtBQUNySEEsQ0FBQ0E7QUFGZSxtQkFBVyxjQUUxQixDQUFBO0FBQ0QsbUJBQTBCLEtBQVksSUFBWUMsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUEsSUFBSUEsSUFBSUEsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFBekUsaUJBQVMsWUFBZ0UsQ0FBQTtBQUN6Rix5QkFBZ0MsS0FBMkIsRUFBRSxLQUFZO0lBQ3hFQyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM5RkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDZEEsQ0FBQ0E7QUFIZSx1QkFBZSxrQkFHOUIsQ0FBQTtBQUNELGNBQXFCLEtBQTJCLEVBQUUsS0FBWTtJQUM3REMsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLElBQUlBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2hCQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtJQUNsQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEZBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0lBQzdGQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtBQUNkQSxDQUFDQTtBQVBlLFlBQUksT0FPbkIsQ0FBQTtBQUNELGVBQXNCLEtBQTJCLEVBQUUsS0FBWTtJQUM5REMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDeERBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQ2xHQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtBQUNkQSxDQUFDQTtBQUplLGFBQUssUUFJcEIsQ0FBQTtBQUNELGFBQW9CLEtBQTJCLEVBQUUsS0FBWTtJQUM1REMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDeERBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzNFQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNwR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDZEEsQ0FBQ0E7QUFMZSxXQUFHLE1BS2xCLENBQUE7QUFDRCxjQUFxQixLQUEyQixFQUFFLEtBQVk7SUFDN0RDLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzlFQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNoSUEs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dEVDLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQzNDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4REEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDZEEsQ0FBQ0E7QUFKZSxxQkFBYSxnQkFJNUIsQ0FBQTtBQUNELHVCQUE4QixLQUEyQixFQUFFLEtBQVk7SUFDdEVDLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQzVCQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNsQkEsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDWkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDaENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ3pCQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNkQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN4QkEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7QUFDWkEsQ0FBQ0E7QUFUZSxxQkFBYSxnQkFTNUIsQ0FBQTtBQUNELHdCQUErQixLQUEyQixFQUFFLEtBQVk7SUFDdkVDLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQzVCQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNsQkEsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDWkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDaENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ3pCQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNkQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN4QkEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7QUFDWkEsQ0FBQ0E7QUFUZSxzQkFBYyxpQkFTN0IsQ0FBQTtBQUNELGdCQUF1QixLQUEyQixFQUFFLEtBQVk7SUFDL0RDLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3ZEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4REEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDZEEsQ0FBQ0E7QUFKZSxjQUFNLFNBSXJCLENBQUEiLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vc3JjIn0=
