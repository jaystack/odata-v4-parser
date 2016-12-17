import * as Utils from "./utils";

export class TokenType {
    static Literal = "Literal";
    static ArrayOrObject = "ArrayOrObject";
    static Array = "Array";
    static Object = "Object";
    static Property = "Property";
    static Annotation = "Annotation";
    static Enum = "Enum";
    static EnumValue = "EnumValue";
    static EnumMemberValue = "EnumMemberValue";
    static Identifier = "Identifier";
    static QualifiedEntityTypeName = "QualifiedEntityTypeName";
    static QualifiedComplexTypeName = "QualifiedComplexTypeName";
    static ODataIdentifier = "ODataIdentifier";
    static Collection = "Collection";
    static NamespacePart = "NamespacePart";
    static EntitySetName = "EntitySetName";
    static SingletonEntity = "SingletonEntity";
    static EntityTypeName = "EntityTypeName";
    static ComplexTypeName = "ComplexTypeName";
    static TypeDefinitionName = "TypeDefinitionName";
    static EnumerationTypeName = "EnumerationTypeName";
    static EnumerationMember = "EnumerationMember";
    static TermName = "TermName";
    static PrimitiveProperty = "PrimitiveProperty";
    static PrimitiveKeyProperty = "PrimitiveKeyProperty";
    static PrimitiveNonKeyProperty = "PrimitiveNonKeyProperty";
    static PrimitiveCollectionProperty = "PrimitiveCollectionProperty";
    static ComplexProperty = "ComplexProperty";
    static ComplexCollectionProperty = "ComplexCollectionProperty";
    static StreamProperty = "StreamProperty";
    static NavigationProperty = "NavigationProperty";
    static EntityNavigationProperty = "EntityNavigationProperty";
    static EntityCollectionNavigationProperty = "EntityCollectionNavigationProperty";
    static Action = "Action";
    static ActionImport = "ActionImport";
    static Function = "Function";
    static EntityFunction = "EntityFunction";
    static EntityCollectionFunction = "EntityCollectionFunction";
    static ComplexFunction = "ComplexFunction";
    static ComplexCollectionFunction = "ComplexCollectionFunction";
    static PrimitiveFunction = "PrimitiveFunction";
    static PrimitiveCollectionFunction = "PrimitiveCollectionFunction";
    static EntityFunctionImport = "EntityFunctionImport";
    static EntityCollectionFunctionImport = "EntityCollectionFunctionImport";
    static ComplexFunctionImport = "ComplexFunctionImport";
    static ComplexCollectionFunctionImport = "ComplexCollectionFunctionImport";
    static PrimitiveFunctionImport = "PrimitiveFunctionImport";
    static PrimitiveCollectionFunctionImport = "PrimitiveCollectionFunctionImport";
    static CommonExpression = "CommonExpression";
    static AndExpression = "AndExpression";
    static OrExpression = "OrExpression";
    static EqualsExpression = "EqualsExpression";
    static NotEqualsExpression = "NotEqualsExpression";
    static LesserThanExpression = "LesserThanExpression";
    static LesserOrEqualsExpression = "LesserOrEqualsExpression";
    static GreaterThanExpression = "GreaterThanExpression";
    static GreaterOrEqualsExpression = "GreaterOrEqualsExpression";
    static HasExpression = "HasExpression";
    static AddExpression = "AddExpression";
    static SubExpression = "SubExpression";
    static MulExpression = "MulExpression";
    static DivExpression = "DivExpression";
    static ModExpression = "ModExpression";
    static NotExpression = "NotExpression";
    static BoolParenExpression = "BoolParenExpression";
    static ParenExpression = "ParenExpression";
    static MethodCallExpression = "MethodCallExpression";
    static IsOfExpression = "IsOfExpression";
    static CastExpression = "CastExpression";
    static NegateExpression = "NegateExpression";
    static FirstMemberExpression = "FirstMemberExpression";
    static MemberExpression = "MemberExpression";
    static PropertyPathExpression = "PropertyPathExpression";
    static ImplicitVariableExpression = "ImplicitVariableExpression";
    static LambdaVariable = "LambdaVariable";
    static LambdaVariableExpression = "LambdaVariableExpression";
    static LambdaPredicateExpression = "LambdaPredicateExpression";
    static AnyExpression = "AnyExpression";
    static AllExpression = "AllExpression";
    static CollectionNavigationExpression = "CollectionNavigationExpression";
    static SimpleKey = "SimpleKey";
    static CompoundKey = "CompoundKey";
    static KeyValuePair = "KeyValuePair";
    static KeyPropertyValue = "KeyPropertyValue";
    static KeyPropertyAlias = "KeyPropertyAlias";
    static SingleNavigationExpression = "SingleNavigationExpression";
    static CollectionPathExpression = "CollectionPathExpression";
    static ComplexPathExpression = "ComplexPathExpression";
    static SinglePathExpression = "SinglePathExpression";
    static FunctionExpression = "FunctionExpression";
    static FunctionExpressionParameters = "FunctionExpressionParameters";
    static FunctionExpressionParameter = "FunctionExpressionParameter";
    static ParameterName = "ParameterName";
    static ParameterAlias = "ParameterAlias";
    static ParameterValue = "ParameterValue";
    static CountExpression = "CountExpression";
    static RefExpression = "RefExpression";
    static ValueExpression = "ValueExpression";
    static RootExpression = "RootExpression";
    static QueryOptions = "QueryOptions";
    static Expand = "Expand";
    static ExpandItem = "ExpandItem";
    static ExpandPath = "ExpandPath";
    static ExpandCountOption = "ExpandCountOption";
    static ExpandRefOption = "ExpandRefOption";
    static ExpandOption = "ExpandOption";
    static Levels = "Levels";
    static Search = "Search";
    static SearchExpression = "SearchExpression";
    static SearchParenExpression = "SearchParenExpression";
    static SearchNotExpression = "SearchNotExpression";
    static SearchOrExpression = "SearchOrExpression";
    static SearchAndExpression = "SearchAndExpression";
    static SearchTerm = "SearchTerm";
    static SearchPhrase = "SearchPhrase";
    static SearchWord = "SearchWord";
    static Filter = "Filter";
    static OrderBy = "OrderBy";
    static OrderByItem = "OrderByItem";
    static Skip = "Skip";
    static Top = "Top";
    static Format = "Format";
    static InlineCount = "InlineCount";
    static Select = "Select";
    static SelectItem = "SelectItem";
    static SelectPath = "SelectPath";
    static AliasAndValue = "AliasAndValue";
    static SkipToken = "SkipToken";
    static Id = "Id";
    static Crossjoin = "Crossjoin";
    static AllResource = "AllResource";
    static ActionImportCall = "ActionImportCall";
    static FunctionImportCall = "FunctionImportCall";
    static EntityCollectionFunctionImportCall = "EntityCollectionFunctionImportCall";
    static EntityFunctionImportCall = "EntityFunctionImportCall";
    static ComplexCollectionFunctionImportCall = "ComplexCollectionFunctionImportCall";
    static ComplexFunctionImportCall = "ComplexFunctionImportCall";
    static PrimitiveCollectionFunctionImportCall = "PrimitiveCollectionFunctionImportCall";
    static PrimitiveFunctionImportCall = "PrimitiveFunctionImportCall";
    static FunctionParameters = "FunctionParameters";
    static FunctionParameter = "FunctionParameter";
    static ResourcePath = "ResourcePath";
    static CollectionNavigation = "CollectionNavigation";
    static CollectionNavigationPath = "CollectionNavigationPath";
    static SingleNavigation = "SingleNavigation";
    static PropertyPath = "PropertyPath";
    static ComplexPath = "ComplexPath";
    static BoundOperation = "BoundOperation";
    static BoundActionCall = "BoundActionCall";
    static BoundEntityFunctionCall = "BoundEntityFunctionCall";
    static BoundEntityCollectionFunctionCall = "BoundEntityCollectionFunctionCall";
    static BoundComplexFunctionCall = "BoundComplexFunctionCall";
    static BoundComplexCollectionFunctionCall = "BoundComplexCollectionFunctionCall";
    static BoundPrimitiveFunctionCall = "BoundPrimitiveFunctionCall";
    static BoundPrimitiveCollectionFunctionCall = "BoundPrimitiveCollectionFunctionCall";
    static ODataUri = "ODataUri";
    static Batch = "Batch";
    static Entity = "Entity";
    static Metadata = "Metadata";
}

export class Token {
    position: number;
    next: number;
    value: any;
    type: TokenType;
    raw: string;
    metadata: any;
    constructor(token) {
        this.position = token.position;
        this.next = token.next;
        this.value = token.value;
        this.type = token.type;
        this.raw = token.raw;
    }
}

export function tokenize(value: number[] | Uint8Array, index: number, next: number, tokenValue: any, tokenType: TokenType): Token {
    return new Token({
        position: index,
        next: next,
        value: tokenValue,
        type: tokenType,
        raw: Utils.stringify(value, index, next)
    });
}

export function clone(token): Token {
    return new Token({
        position: token.position,
        next: token.next,
        value: token.value,
        type: token.type,
        raw: token.raw
    });
}

// core definitions
export function ALPHA(value: number): boolean { return (value >= 0x41 && value <= 0x5a) || (value >= 0x61 && value <= 0x7a); }
export function DIGIT(value: number): boolean { return (value >= 0x30 && value <= 0x39); }
export function HEXDIG(value: number): boolean { return DIGIT(value) || AtoF(value); }
export function AtoF(value: number): boolean { return (value >= 0x41 && value <= 0x46) || (value >= 0x61 && value <= 0x66); }
export function DQUOTE(value: number): boolean { return value === 0x22; }
export function SP(value: number): boolean { return value === 0x20; }
export function HTAB(value: number): boolean { return value === 0x09; }
export function VCHAR(value: number): boolean { return value >= 0x21 && value <= 0x7e; }

// punctuation
function whitespaceLength(value, index) {
    if (Utils.equals(value, index, "%20") || Utils.equals(value, index, "%09")) return 3;
    else if (SP(value[index]) || HTAB(value[index]) || value[index] === 0x20 || value[index] === 0x09) return 1;
}

export function OWS(value: number[] | Uint8Array, index: number): number {
    index = index || 0;
    let inc = whitespaceLength(value, index);
    while (inc) {
        index += inc;
        inc = whitespaceLength(value, index);
    }
    return index;
}
export function RWS(value: number[] | Uint8Array, index: number): number {
    return OWS(value, index);
}
export function BWS(value: number[] | Uint8Array, index: number): number {
    return OWS(value, index);
}

export function AT(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x40) return index + 1;
    else if (Utils.equals(value, index, "%40")) return index + 3;
}
export function COLON(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x3a) return index + 1;
    else if (Utils.equals(value, index, "%3A")) return index + 3;
}
export function COMMA(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x2c) return index + 1;
    else if (Utils.equals(value, index, "%2C")) return index + 3;
}
export function EQ(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x3d) return index + 1;
}
export function SIGN(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x2b || value[index] === 0x2d) return index + 1;
    else if (Utils.equals(value, index, "%2B")) return index + 3;
}
export function SEMI(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x3b) return index + 1;
    else if (Utils.equals(value, index, "%3B")) return index + 3;
}
export function STAR(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x2a) return index + 1;
    else if (Utils.equals(value, index, "%2A")) return index + 3;
}
export function SQUOTE(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x27) return index + 1;
    else if (Utils.equals(value, index, "%27")) return index + 3;
}
export function OPEN(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x28) return index + 1;
    else if (Utils.equals(value, index, "%28")) return index + 3;
}
export function CLOSE(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x29) return index + 1;
    else if (Utils.equals(value, index, "%29")) return index + 3;
}
// unreserved ALPHA / DIGIT / "-" / "." / "_" / "~"
export function unreserved(value: number): boolean { return ALPHA(value) || DIGIT(value) || value === 0x2d || value === 0x2e || value === 0x5f || value === 0x7e; }
// other-delims "!" /                   "(" / ")" / "*" / "+" / "," / ";"
export function otherDelims(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x21 || value[index] === 0x2b) return index + 1;
    else return OPEN(value, index) || CLOSE(value, index) || STAR(value, index) || COMMA(value, index) || SEMI(value, index);
}
// sub-delims     =       "$" / "&" / "'" /                                     "=" / other-delims
export function subDelims(value: number[] | Uint8Array, index: number): number {
    if (value[index] === 0x24 || value[index] === 0x26) return index + 1;
    else return SQUOTE(value, index) || EQ(value, index) || otherDelims(value, index);
}
export function pctEncoded(value: number[] | Uint8Array, index: number): number {
    if (value[index] !== 0x25 || !HEXDIG(value[index + 1]) || !HEXDIG(value[index + 2])) return index;
    return index + 3;
}
// pct-encoded-no-SQUOTE = "%" ( "0" / "1" /   "3" / "4" / "5" / "6" / "8" / "9" / A-to-F ) HEXDIG
//                       / "%" "2" ( "0" / "1" / "2" / "3" / "4" / "5" / "6" /   "8" / "9" / A-to-F )
export function pctEncodedNoSQUOTE(value: number[] | Uint8Array, index: number): number {
    if (Utils.equals(value, index, "%27")) return index;
    return pctEncoded(value, index);
}
export function pctEncodedUnescaped(value: number[] | Uint8Array, index: number): number {
    if (Utils.equals(value, index, "%22") ||
        Utils.equals(value, index, "%3") ||
        Utils.equals(value, index, "%4") ||
        Utils.equals(value, index, "%5C")) return index;
    return pctEncoded(value, index);
}
export function pchar(value: number[] | Uint8Array, index: number): number {
    if (unreserved(value[index])) return index + 1;
    else return subDelims(value, index) || COLON(value, index) || AT(value, index) || pctEncoded(value, index) || index;
}
export function pcharNoSQUOTE(value: number[] | Uint8Array, index: number): number {
    if (unreserved(value[index]) || value[index] === 0x24 || value[index] === 0x26) return index + 1;
    else return otherDelims(value, index) || EQ(value, index) || COLON(value, index) || AT(value, index) || pctEncodedNoSQUOTE(value, index) || index;
}
export function qcharNoAMP(value: number[] | Uint8Array, index: number): number {
    if (unreserved(value[index]) || value[index] === 0x3a || value[index] === 0x40 || value[index] === 0x2f || value[index] === 0x3f || value[index] === 0x24 || value[index] === 0x27 || value[index] === 0x3d) return index + 1;
    else return pctEncoded(value, index) || otherDelims(value, index) || index;
}
export function qcharNoAMPDQUOTE(value: number[] | Uint8Array, index: number): number {
    if (unreserved(value[index]) || value[index] === 0x3a || value[index] === 0x40 || value[index] === 0x2f || value[index] === 0x3f || value[index] === 0x24 || value[index] === 0x27 || value[index] === 0x3d) return index + 1;
    else return otherDelims(value, index) || pctEncodedUnescaped(value, index);
}
// export function pchar(value:number):boolean { return unreserved(value) || otherDelims(value) || value == 0x24 || value == 0x26 || EQ(value) || COLON(value) || AT(value); }
export function base64char(value: number): boolean { return ALPHA(value) || DIGIT(value) || value === 0x2d || value === 0x5f; }
export function base64b16(value: number[] | Uint8Array, index: number): number {
    let start = index;
    if (!base64char(value[index]) && !base64char(value[index + 1])) return start;
    index += 2;

    if (!Utils.is(value[index], "AEIMQUYcgkosw048")) return start;
    index++;

    if (value[index] === 0x3d) index++;
    return index;
}
export function base64b8(value: number[] | Uint8Array, index: number): number {
    let start = index;
    if (!base64char(value[index])) return start;
    index++;

    if (value[index] !== 0x41 || value[index] !== 0x51 || value[index] !== 0x67 || value[index] !== 0x77) return start;
    index++;

    if (value[index] === 0x3d && value[index + 1] === 0x3d) index += 2;
    return index;
}
export function nanInfinity(value: number[] | Uint8Array, index: number): number {
    return Utils.equals(value, index, "NaN") || Utils.equals(value, index, "-INF") || Utils.equals(value, index, "INF");
}
export function oneToNine(value: number): boolean { return value !== 0x30 && DIGIT(value); }
export function zeroToFiftyNine(value: number[] | Uint8Array, index: number): number {
    if (value[index] >= 0x30 && value[index] <= 0x35 && DIGIT(value[index + 1])) return index + 2;
    return index;
}
export function year(value: number[] | Uint8Array, index: number): number {
    let start = index;
    let end = index;
    if (value[index] === 0x2d) index++;
    if ((value[index] === 0x30 && (end = Utils.required(value, index + 1, DIGIT, 3, 3))) ||
        (oneToNine(value[index]) && (end = Utils.required(value, index + 1, DIGIT, 3)))) return end;
    return start;
}
export function month(value: number[] | Uint8Array, index: number): number {
    if ((value[index] === 0x30 && oneToNine(value[index + 1])) ||
        (value[index] === 0x31 && value[index + 1] >= 0x30 && value[index + 1] <= 0x32)) return index + 2;
    return index;
}
export function day(value: number[] | Uint8Array, index: number): number {
    if ((value[index] === 0x30 && oneToNine(value[index + 1])) ||
        ((value[index] === 0x31 || value[index] === 0x32) && DIGIT(value[index + 1])) ||
        (value[index] === 0x33 && (value[index + 1] === 0x30 || value[index + 1] === 0x31))) return index + 2;
    return index;
}
export function hour(value: number[] | Uint8Array, index: number): number {
    if (((value[index] === 0x30 || value[index] === 0x31) && DIGIT(value[index + 1])) ||
        (value[index] === 0x32 && (value[index + 1] === 0x30 || value[index + 1] === 0x31 || value[index + 1] === 0x32 || value[index + 1] === 0x33))) return index + 2;
    return index;
}
export function minute(value: number[] | Uint8Array, index: number): number {
    return zeroToFiftyNine(value, index);
}
export function second(value: number[] | Uint8Array, index: number): number {
    return zeroToFiftyNine(value, index);
}
export function fractionalSeconds(value: number[] | Uint8Array, index: number): number {
    return Utils.required(value, index, DIGIT, 1, 12);
}
export function geographyPrefix(value: number[] | Uint8Array, index: number): number {
    return Utils.equals(value, index, "geography") ? index + 9 : index;
}
export function geometryPrefix(value: number[] | Uint8Array, index: number): number {
    return Utils.equals(value, index, "geometry") ? index + 8 : index;
}
export function identifierLeadingCharacter(value: number): boolean {
    return ALPHA(value) || value === 0x5f;
}
export function identifierCharacter(value: number): boolean {
    return identifierLeadingCharacter(value) || DIGIT(value);
}
export function beginObject(value: number[] | Uint8Array, index: number): number {
    let bws = BWS(value, index);
    let start = index;
    index = bws;
    if (Utils.equals(value, index, "{")) index++;
    else if (Utils.equals(value, index, "%7B")) index += 3;
    if (index === bws) return start;

    bws = BWS(value, index);
    return bws;
}
export function endObject(value: number[] | Uint8Array, index: number): number {
    let bws = BWS(value, index);
    let start = index;
    index = bws;
    if (Utils.equals(value, index, "}")) index++;
    else if (Utils.equals(value, index, "%7D")) index += 3;
    if (index === bws) return start;

    bws = BWS(value, index);
    return bws;
}
export function beginArray(value: number[] | Uint8Array, index: number): number {
    let bws = BWS(value, index);
    let start = index;
    index = bws;
    if (Utils.equals(value, index, "[")) index++;
    else if (Utils.equals(value, index, "%5B")) index += 3;
    if (index === bws) return start;

    bws = BWS(value, index);
    return bws;
}
export function endArray(value: number[] | Uint8Array, index: number): number {
    let bws = BWS(value, index);
    let start = index;
    index = bws;
    if (Utils.equals(value, index, "]")) index++;
    else if (Utils.equals(value, index, "%5D")) index += 3;
    if (index === bws) return start;

    bws = BWS(value, index);
    return bws;
}
export function quotationMark(value: number[] | Uint8Array, index: number): number {
    if (DQUOTE(value[index])) return index + 1;
    if (Utils.equals(value, index, "%22")) return index + 3;
    return index;
}
export function nameSeparator(value: number[] | Uint8Array, index: number): number {
    let bws = BWS(value, index);
    let start = index;
    index = bws;
    let colon = COLON(value, index);
    if (!colon) return start;
    index = colon;
    bws = BWS(value, index);
    return bws;
}
export function valueSeparator(value: number[] | Uint8Array, index: number): number {
    let bws = BWS(value, index);
    let start = index;
    index = bws;
    let comma = COMMA(value, index);
    if (!comma) return start;
    index = comma;
    bws = BWS(value, index);
    return bws;
}
export function escape(value: number[] | Uint8Array, index: number): number {
    if (Utils.equals(value, index, "\\")) return index + 1;
    if (Utils.equals(value, index, "%5C")) return index + 3;
    return index;
}
