"use strict";
var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
var NameOrIdentifier = require('./nameOrIdentifier');
var Expressions = require('./expressions');
function complexColInUri(value, index) {
    var begin = Lexer.beginArray(value, index);
    if (begin == index)
        return;
    var start = index;
    index = begin;
    var items = [];
    var token = complexInUri(value, index);
    if (token) {
        while (token) {
            items.push(token);
            index = token.next;
            var end = Lexer.endArray(value, index);
            if (end > index) {
                index = end;
                break;
            }
            else {
                var separator = Lexer.valueSeparator(value, index);
                if (separator == index)
                    return;
                index = separator;
                token = complexInUri(value, index);
                if (!token)
                    return;
            }
        }
    }
    else {
        var end = Lexer.endArray(value, index);
        if (end == index)
            return;
        index = end;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Array);
}
exports.complexColInUri = complexColInUri;
function complexInUri(value, index) {
    var begin = Lexer.beginObject(value, index);
    if (begin == index)
        return;
    var start = index;
    index = begin;
    var items = [];
    var token = annotationInUri(value, index) ||
        primitivePropertyInUri(value, index) ||
        complexPropertyInUri(value, index) ||
        collectionPropertyInUri(value, index) ||
        navigationPropertyInUri(value, index);
    if (token) {
        while (token) {
            items.push(token);
            index = token.next;
            var end = Lexer.endObject(value, index);
            if (end > index) {
                index = end;
                break;
            }
            else {
                var separator = Lexer.valueSeparator(value, index);
                if (separator == index)
                    return;
                index = separator;
                token = annotationInUri(value, index) ||
                    primitivePropertyInUri(value, index) ||
                    complexPropertyInUri(value, index) ||
                    collectionPropertyInUri(value, index) ||
                    navigationPropertyInUri(value, index);
                if (!token)
                    return;
            }
        }
    }
    else {
        var end = Lexer.endObject(value, index);
        if (end == index)
            return;
        index = end;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Object);
}
exports.complexInUri = complexInUri;
function collectionPropertyInUri(value, index) {
    var mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    var start = index;
    index = mark;
    var prop = NameOrIdentifier.primitiveColProperty(value, index) ||
        NameOrIdentifier.complexColProperty(value, index);
    if (!prop)
        return;
    index = prop.next;
    mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    index = mark;
    var separator = Lexer.nameSeparator(value, index);
    if (separator == index)
        return;
    index = separator;
    var propValue = prop.type == Lexer.TokenType.PrimitiveCollectionProperty
        ? primitiveColInUri(value, index)
        : complexColInUri(value, index);
    if (!propValue)
        return;
    index = propValue.next;
    return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}
exports.collectionPropertyInUri = collectionPropertyInUri;
function primitiveColInUri(value, index) {
    var begin = Lexer.beginArray(value, index);
    if (begin == index)
        return;
    var start = index;
    index = begin;
    var items = [];
    var token = primitiveLiteralInJSON(value, index);
    if (token) {
        while (token) {
            items.push(token);
            index = token.next;
            var end = Lexer.endArray(value, index);
            if (end > index) {
                index = end;
                break;
            }
            else {
                var separator = Lexer.valueSeparator(value, index);
                if (separator == index)
                    return;
                index = separator;
                token = primitiveLiteralInJSON(value, index);
                if (!token)
                    return;
            }
        }
    }
    else {
        var end = Lexer.endArray(value, index);
        if (end == index)
            return;
        index = end;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Array);
}
exports.primitiveColInUri = primitiveColInUri;
function complexPropertyInUri(value, index) {
    var mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    var start = index;
    index = mark;
    var prop = NameOrIdentifier.complexProperty(value, index);
    if (!prop)
        return;
    index = prop.next;
    mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    index = mark;
    var separator = Lexer.nameSeparator(value, index);
    if (separator == index)
        return;
    index = separator;
    var propValue = complexInUri(value, index);
    if (!propValue)
        return;
    index = propValue.next;
    return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}
exports.complexPropertyInUri = complexPropertyInUri;
function annotationInUri(value, index) {
    var mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    var start = index;
    index = mark;
    if (!Lexer.AT(value[index]))
        return;
    index++;
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext == index)
        return;
    var namespaceStart = index;
    index = namespaceNext;
    if (value[index] != 0x2e)
        return;
    index++;
    var term = NameOrIdentifier.termName(value, index);
    if (!term)
        return;
    index = term.next;
    mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    index = mark;
    var separator = Lexer.nameSeparator(value, index);
    if (separator == index)
        return;
    index = separator;
    var token = complexInUri(value, index) ||
        complexColInUri(value, index) ||
        primitiveLiteralInJSON(value, index) ||
        primitiveColInUri(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, {
        key: '@' + Utils.stringify(value, namespaceStart, namespaceNext) + '.' + term.raw,
        value: token
    }, Lexer.TokenType.Annotation);
}
exports.annotationInUri = annotationInUri;
function keyValuePairInUri(value, index, keyFn, valueFn) {
    var mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    var start = index;
    index = mark;
    var prop = keyFn(value, index);
    if (!prop)
        return;
    index = prop.next;
    mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    index = mark;
    var separator = Lexer.nameSeparator(value, index);
    if (separator == index)
        return;
    index = separator;
    var propValue = valueFn(value, index);
    if (!propValue)
        return;
    index = propValue.next;
    return Lexer.tokenize(value, start, index, { key: prop, value: propValue }, Lexer.TokenType.Property);
}
exports.keyValuePairInUri = keyValuePairInUri;
function primitivePropertyInUri(value, index) {
    return keyValuePairInUri(value, index, NameOrIdentifier.primitiveProperty, primitiveLiteralInJSON);
}
exports.primitivePropertyInUri = primitivePropertyInUri;
function navigationPropertyInUri(value, index) {
    return singleNavPropInJSON(value, index) ||
        collectionNavPropInJSON(value, index);
}
exports.navigationPropertyInUri = navigationPropertyInUri;
function singleNavPropInJSON(value, index) {
    return keyValuePairInUri(value, index, NameOrIdentifier.entityNavigationProperty, Expressions.rootExpr);
}
exports.singleNavPropInJSON = singleNavPropInJSON;
function collectionNavPropInJSON(value, index) {
    return keyValuePairInUri(value, index, NameOrIdentifier.entityColNavigationProperty, rootExprCol);
}
exports.collectionNavPropInJSON = collectionNavPropInJSON;
function rootExprCol(value, index) {
    var begin = Lexer.beginArray(value, index);
    if (begin == index)
        return;
    var start = index;
    index = begin;
    var items = [];
    var token = Expressions.rootExpr(value, index);
    if (token) {
        while (token) {
            items.push(token);
            index = token.next;
            var end = Lexer.endArray(value, index);
            if (end > index) {
                index = end;
                break;
            }
            else {
                var separator = Lexer.valueSeparator(value, index);
                if (separator == index)
                    return;
                index = separator;
                token = Expressions.rootExpr(value, index);
                if (!token)
                    return;
            }
        }
    }
    else {
        var end = Lexer.endArray(value, index);
        if (end == index)
            return;
        index = end;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Array);
}
exports.rootExprCol = rootExprCol;
function primitiveLiteralInJSON(value, index) {
    return stringInJSON(value, index) ||
        numberInJSON(value, index) ||
        booleanInJSON(value, index) ||
        nullInJSON(value, index);
}
exports.primitiveLiteralInJSON = primitiveLiteralInJSON;
function stringInJSON(value, index) {
    var mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    var start = index;
    index = mark;
    var char = charInJSON(value, index);
    while (char > index) {
        index = char;
        char = charInJSON(value, index);
    }
    mark = Lexer.quotationMark(value, index);
    if (mark == index)
        return;
    index = mark;
    return Lexer.tokenize(value, start, index, 'string', Lexer.TokenType.Literal);
}
exports.stringInJSON = stringInJSON;
function charInJSON(value, index) {
    var escape = Lexer.escape(value, index);
    if (escape > index) {
        if (Utils.equals(value, escape, '%2F'))
            return escape + 3;
        if (Utils.equals(value, escape, '/') ||
            Utils.equals(value, escape, 'b') ||
            Utils.equals(value, escape, 'f') ||
            Utils.equals(value, escape, 'n') ||
            Utils.equals(value, escape, 'r') ||
            Utils.equals(value, escape, 't'))
            return escape + 1;
        if (Utils.equals(value, escape, 'u') &&
            Utils.required(value, escape + 1, Lexer.HEXDIG, 4, 4))
            return escape + 5;
        var escapeNext = Lexer.escape(value, escape);
        if (escapeNext > escape)
            return escapeNext;
        var mark = Lexer.quotationMark(value, escape);
        if (mark > escape)
            return mark;
    }
    else {
        var mark = Lexer.quotationMark(value, index);
        if (mark == index)
            return index + 1;
    }
}
exports.charInJSON = charInJSON;
function numberInJSON(value, index) {
    var token = PrimitiveLiteral.doubleValue(value, index) ||
        PrimitiveLiteral.int64Value(value, index);
    if (token) {
        token.value = 'number';
        return token;
    }
}
exports.numberInJSON = numberInJSON;
function booleanInJSON(value, index) {
    if (Utils.equals(value, index, 'true'))
        return Lexer.tokenize(value, index, index + 4, 'boolean', Lexer.TokenType.Literal);
    if (Utils.equals(value, index, 'false'))
        return Lexer.tokenize(value, index, index + 5, 'boolean', Lexer.TokenType.Literal);
}
exports.booleanInJSON = booleanInJSON;
function nullInJSON(value, index) {
    if (Utils.equals(value, index, 'null'))
        return Lexer.tokenize(value, index, index + 4, 'null', Lexer.TokenType.Literal);
}
exports.nullInJSON = nullInJSON;
function arrayOrObject(value, index) {
    var token = complexColInUri(value, index) ||
        complexInUri(value, index) ||
        rootExprCol(value, index) ||
        primitiveColInUri(value, index);
    if (token)
        return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.ArrayOrObject);
}
exports.arrayOrObject = arrayOrObject;
//# sourceMappingURL=json.js.map