import * as Utils from "./utils";
import * as Lexer from "./lexer";
import * as PrimitiveLiteral from "./primitiveLiteral";
import * as NameOrIdentifier from "./nameOrIdentifier";
import * as Expressions from "./expressions";

export function complexColInUri(value: number[] | Uint8Array, index: number): Lexer.Token {
    let begin = Lexer.beginArray(value, index);
    if (begin === index) return;
    let start = index;
    index = begin;

    let items = [];
    let token = complexInUri(value, index);
    if (token) {
        while (token) {
            items.push(token);
            index = token.next;

            let end = Lexer.endArray(value, index);
            if (end > index) {
                index = end;
                break;
            } else {
                let separator = Lexer.valueSeparator(value, index);
                if (separator === index) return;
                index = separator;

                token = complexInUri(value, index);
                if (!token) return;
            }
        }
    } else {
        let end = Lexer.endArray(value, index);
        if (end === index) return;
        index = end;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
}

export function complexInUri(value: number[] | Uint8Array, index: number): Lexer.Token {
    let begin = Lexer.beginObject(value, index);
    if (begin === index) return;
    let start = index;
    index = begin;

    let items = [];
    let token = annotationInUri(value, index) ||
        primitivePropertyInUri(value, index) ||
        complexPropertyInUri(value, index) ||
        collectionPropertyInUri(value, index) ||
        navigationPropertyInUri(value, index);
    if (token) {
        while (token) {
            items.push(token);
            index = token.next;

            let end = Lexer.endObject(value, index);
            if (end > index) {
                index = end;
                break;
            } else {
                let separator = Lexer.valueSeparator(value, index);
                if (separator === index) return;
                index = separator;

                token = annotationInUri(value, index) ||
                    primitivePropertyInUri(value, index) ||
                    complexPropertyInUri(value, index) ||
                    collectionPropertyInUri(value, index) ||
                    navigationPropertyInUri(value, index);
                if (!token) return;
            }
        }
    } else {
        let end = Lexer.endObject(value, index);
        if (end === index) return;
        index = end;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Object);
}

export function collectionPropertyInUri(value: number[] | Uint8Array, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    let start = index;
    index = mark;

    let prop = NameOrIdentifier.primitiveColProperty(value, index) ||
        NameOrIdentifier.complexColProperty(value, index);

    if (!prop) return;
    index = prop.next;

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    let separator = Lexer.nameSeparator(value, index);
    if (separator === index) return;
    index = separator;

    let propValue = prop.type === Lexer.TokenType.PrimitiveCollectionProperty
        ? primitiveColInUri(value, index)
        : complexColInUri(value, index);

    if (!propValue) return;
    index = propValue.next;

    return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}

export function primitiveColInUri(value: number[] | Uint8Array, index: number): Lexer.Token {
    let begin = Lexer.beginArray(value, index);
    if (begin === index) return;
    let start = index;
    index = begin;

    let items = [];
    let token = primitiveLiteralInJSON(value, index);
    if (token) {
        while (token) {
            items.push(token);
            index = token.next;

            let end = Lexer.endArray(value, index);
            if (end > index) {
                index = end;
                break;
            } else {
                let separator = Lexer.valueSeparator(value, index);
                if (separator === index) return;
                index = separator;

                token = primitiveLiteralInJSON(value, index);
                if (!token) return;
            }
        }
    } else {
        let end = Lexer.endArray(value, index);
        if (end === index) return;
        index = end;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
}

export function complexPropertyInUri(value: number[] | Uint8Array, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    let start = index;
    index = mark;

    let prop = NameOrIdentifier.complexProperty(value, index);
    if (!prop) return;
    index = prop.next;

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    let separator = Lexer.nameSeparator(value, index);
    if (separator === index) return;
    index = separator;

    let propValue = complexInUri(value, index);
    if (!propValue) return;
    index = propValue.next;

    return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}

export function annotationInUri(value: number[] | Uint8Array, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    let start = index;
    index = mark;

    let at = Lexer.AT(value, index);
    if (!at) return;
    index = at;

    let ns = NameOrIdentifier.namespace(value, index);
    if (!ns) return;
    let namespaceStart = index;
    index = ns.next;

    if (value[index] !== 0x2e) return;
    index++;

    let term = NameOrIdentifier.termName(value, index);
    if (!term) return;
    index = term.next;

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    let separator = Lexer.nameSeparator(value, index);
    if (separator === index) return;
    index = separator;

    let token = complexInUri(value, index) ||
        complexColInUri(value, index) ||
        primitiveLiteralInJSON(value, index) ||
        primitiveColInUri(value, index);
    if (!token) return;
    index = token.next;

    return Lexer.tokenize(value, start, index, {
        key: "@" + Utils.stringify(value, namespaceStart, ns.next) + "." + term.raw,
        value: token
    }, Lexer.TokenType.Annotation, undefined, ns);
}

export function keyValuePairInUri(value: number[] | Uint8Array, index: number, keyFn: Function, valueFn: Function): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    let start = index;
    index = mark;

    let prop = keyFn(value, index);
    if (!prop) return;
    index = prop.next;

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    let separator = Lexer.nameSeparator(value, index);
    if (separator === index) return;
    index = separator;

    let propValue = valueFn(value, index);
    if (!propValue) return;
    index = propValue.next;

    return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}

export function primitivePropertyInUri(value: number[] | Uint8Array, index: number): Lexer.Token {
    return keyValuePairInUri(value, index, NameOrIdentifier.primitiveProperty, primitiveLiteralInJSON);
}

export function navigationPropertyInUri(value: number[] | Uint8Array, index: number): Lexer.Token {
    return singleNavPropInJSON(value, index) ||
        collectionNavPropInJSON(value, index);
}

export function singleNavPropInJSON(value: number[] | Uint8Array, index: number): Lexer.Token {
    return keyValuePairInUri(value, index, NameOrIdentifier.entityNavigationProperty, Expressions.rootExpr);
}

export function collectionNavPropInJSON(value: number[] | Uint8Array, index: number): Lexer.Token {
    return keyValuePairInUri(value, index, NameOrIdentifier.entityColNavigationProperty, rootExprCol);
}

export function rootExprCol(value: number[] | Uint8Array, index: number): Lexer.Token {
    let begin = Lexer.beginArray(value, index);
    if (begin === index) return;
    let start = index;
    index = begin;

    let items = [];
    let token = Expressions.rootExpr(value, index);
    if (token) {
        while (token) {
            items.push(token);
            index = token.next;

            let end = Lexer.endArray(value, index);
            if (end > index) {
                index = end;
                break;
            } else {
                let separator = Lexer.valueSeparator(value, index);
                if (separator === index) return;
                index = separator;

                token = Expressions.rootExpr(value, index);
                if (!token) return;
            }
        }
    } else {
        let end = Lexer.endArray(value, index);
        if (end === index) return;
        index = end;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
}

export function primitiveLiteralInJSON(value: number[] | Uint8Array, index: number): Lexer.Token {
    return stringInJSON(value, index) ||
        numberInJSON(value, index) ||
        booleanInJSON(value, index) ||
        nullInJSON(value, index);
}

export function stringInJSON(value: number[] | Uint8Array, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    let start = index;
    index = mark;

    let char = charInJSON(value, index);
    while (char > index) {
        index = char;
        char = charInJSON(value, index);
    }

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    return Lexer.tokenize(value, start, index, "string", Lexer.TokenType.Literal);
}

export function charInJSON(value: number[] | Uint8Array, index: number): number {
    let escape = Lexer.escape(value, index);
    if (escape > index) {
        if (Utils.equals(value, escape, "%2F")) return escape + 3;
        if (Utils.equals(value, escape, "/") ||
            Utils.equals(value, escape, "b") ||
            Utils.equals(value, escape, "f") ||
            Utils.equals(value, escape, "n") ||
            Utils.equals(value, escape, "r") ||
            Utils.equals(value, escape, "t")) return escape + 1;
        if (Utils.equals(value, escape, "u") &&
            Utils.required(value, escape + 1, Lexer.HEXDIG, 4, 4)) return escape + 5;
        let escapeNext = Lexer.escape(value, escape);
        if (escapeNext > escape) return escapeNext;
        let mark = Lexer.quotationMark(value, escape);
        if (mark > escape) return mark;
    } else {
        let mark = Lexer.quotationMark(value, index);
        if (mark === index) return index + 1;
    }
}

export function numberInJSON(value: number[] | Uint8Array, index: number): Lexer.Token {
    let token = PrimitiveLiteral.doubleValue(value, index) ||
        PrimitiveLiteral.int64Value(value, index);
    if (token) {
        token.value = "number";
        return token;
    }
}

export function booleanInJSON(value: number[] | Uint8Array, index: number): Lexer.Token {
    if (Utils.equals(value, index, "true")) return Lexer.tokenize(value, index, index + 4, "boolean", Lexer.TokenType.Literal);
    if (Utils.equals(value, index, "false")) return Lexer.tokenize(value, index, index + 5, "boolean", Lexer.TokenType.Literal);
}

export function nullInJSON(value: number[] | Uint8Array, index: number): Lexer.Token {
    if (Utils.equals(value, index, "null")) return Lexer.tokenize(value, index, index + 4, "null", Lexer.TokenType.Literal);
}

export function arrayOrObject(value: number[] | Uint8Array, index: number): Lexer.Token {
    let token = complexColInUri(value, index) ||
        complexInUri(value, index) ||
        rootExprCol(value, index) ||
        primitiveColInUri(value, index);

    if (token) return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.ArrayOrObject);
}
