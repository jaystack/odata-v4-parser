import Utils from './utils';
import Lexer from './lexer';
import PrimitiveLiteral from './primitiveLiteral';
import NameOrIdentifier from './nameOrIdentifier';
import Expressions from './expressions';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ArrayOrObject {
  export function complexColInUri(value: Utils.SourceArray, index: number): Lexer.Token {
    const begin = Lexer.beginArray(value, index);
    if (begin === index) return;
    const start = index;
    index = begin;

    const items = [];
    let token = ArrayOrObject.complexInUri(value, index);
    if (token) {
      while (token) {
        items.push(token);
        index = token.next;

        const end = Lexer.endArray(value, index);
        if (end > index) {
          index = end;
          break;
        } else {
          const separator = Lexer.valueSeparator(value, index);
          if (separator === index) return;
          index = separator;

          token = ArrayOrObject.complexInUri(value, index);
          if (!token) return;
        }
      }
    } else {
      const end = Lexer.endArray(value, index);
      if (end === index) return;
      index = end;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
  }

  export function complexInUri(value: Utils.SourceArray, index: number): Lexer.Token {
    const begin = Lexer.beginObject(value, index);
    if (begin === index) return;
    const start = index;
    index = begin;

    const items = [];
    let token =
      ArrayOrObject.annotationInUri(value, index) ||
      ArrayOrObject.primitivePropertyInUri(value, index) ||
      ArrayOrObject.complexPropertyInUri(value, index) ||
      ArrayOrObject.collectionPropertyInUri(value, index) ||
      ArrayOrObject.navigationPropertyInUri(value, index);
    if (token) {
      while (token) {
        items.push(token);
        index = token.next;

        const end = Lexer.endObject(value, index);
        if (end > index) {
          index = end;
          break;
        } else {
          const separator = Lexer.valueSeparator(value, index);
          if (separator === index) return;
          index = separator;

          token =
            ArrayOrObject.annotationInUri(value, index) ||
            ArrayOrObject.primitivePropertyInUri(value, index) ||
            ArrayOrObject.complexPropertyInUri(value, index) ||
            ArrayOrObject.collectionPropertyInUri(value, index) ||
            ArrayOrObject.navigationPropertyInUri(value, index);
          if (!token) return;
        }
      }
    } else {
      const end = Lexer.endObject(value, index);
      if (end === index) return;
      index = end;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Object);
  }

  export function collectionPropertyInUri(value: Utils.SourceArray, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    const start = index;
    index = mark;

    const prop =
      NameOrIdentifier.primitiveColProperty(value, index) ||
      NameOrIdentifier.complexColProperty(value, index);

    if (!prop) return;
    index = prop.next;

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    const separator = Lexer.nameSeparator(value, index);
    if (separator === index) return;
    index = separator;

    const propValue =
      prop.type === Lexer.TokenType.PrimitiveCollectionProperty
        ? ArrayOrObject.primitiveColInUri(value, index)
        : ArrayOrObject.complexColInUri(value, index);

    if (!propValue) return;
    index = propValue.next;

    return Lexer.tokenize(
      value,
      start,
      index,
      { key: prop, value: propValue },
      Lexer.TokenType.Property,
    );
  }

  export function primitiveColInUri(value: Utils.SourceArray, index: number): Lexer.Token {
    const begin = Lexer.beginArray(value, index);
    if (begin === index) return;
    const start = index;
    index = begin;

    const items = [];
    let token = ArrayOrObject.primitiveLiteralInJSON(value, index);
    if (token) {
      while (token) {
        items.push(token);
        index = token.next;

        const end = Lexer.endArray(value, index);
        if (end > index) {
          index = end;
          break;
        } else {
          const separator = Lexer.valueSeparator(value, index);
          if (separator === index) return;
          index = separator;

          token = ArrayOrObject.primitiveLiteralInJSON(value, index);
          if (!token) return;
        }
      }
    } else {
      const end = Lexer.endArray(value, index);
      if (end === index) return;
      index = end;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
  }

  export function complexPropertyInUri(value: Utils.SourceArray, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    const start = index;
    index = mark;

    const prop = NameOrIdentifier.complexProperty(value, index);
    if (!prop) return;
    index = prop.next;

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    const separator = Lexer.nameSeparator(value, index);
    if (separator === index) return;
    index = separator;

    const propValue = ArrayOrObject.complexInUri(value, index);
    if (!propValue) return;
    index = propValue.next;

    return Lexer.tokenize(
      value,
      start,
      index,
      { key: prop, value: propValue },
      Lexer.TokenType.Property,
    );
  }

  export function annotationInUri(value: Utils.SourceArray, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    const start = index;
    index = mark;

    const at = Lexer.AT(value, index);
    if (!at) return;
    index = at;

    const namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext === index) return;
    const namespaceStart = index;
    index = namespaceNext;

    if (value[index] !== 0x2e) return;
    index++;

    const term = NameOrIdentifier.termName(value, index);
    if (!term) return;
    index = term.next;

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    const separator = Lexer.nameSeparator(value, index);
    if (separator === index) return;
    index = separator;

    const token =
      ArrayOrObject.complexInUri(value, index) ||
      ArrayOrObject.complexColInUri(value, index) ||
      ArrayOrObject.primitiveLiteralInJSON(value, index) ||
      ArrayOrObject.primitiveColInUri(value, index);
    if (!token) return;
    index = token.next;

    return Lexer.tokenize(
      value,
      start,
      index,
      {
        key: '@' + Utils.stringify(value, namespaceStart, namespaceNext) + '.' + term.raw,
        value: token,
      },
      Lexer.TokenType.Annotation,
    );
  }

  export function keyValuePairInUri(
    value: Utils.SourceArray,
    index: number,
    keyFn: Function,
    valueFn: Function,
  ): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    const start = index;
    index = mark;

    const prop = keyFn(value, index);
    if (!prop) return;
    index = prop.next;

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    const separator = Lexer.nameSeparator(value, index);
    if (separator === index) return;
    index = separator;

    const propValue = valueFn(value, index);
    if (!propValue) return;
    index = propValue.next;

    return Lexer.tokenize(
      value,
      start,
      index,
      { key: prop, value: propValue },
      Lexer.TokenType.Property,
    );
  }

  export function primitivePropertyInUri(value: Utils.SourceArray, index: number): Lexer.Token {
    return ArrayOrObject.keyValuePairInUri(
      value,
      index,
      NameOrIdentifier.primitiveProperty,
      primitiveLiteralInJSON,
    );
  }

  export function navigationPropertyInUri(value: Utils.SourceArray, index: number): Lexer.Token {
    return (
      ArrayOrObject.singleNavPropInJSON(value, index) ||
      ArrayOrObject.collectionNavPropInJSON(value, index)
    );
  }

  export function singleNavPropInJSON(value: Utils.SourceArray, index: number): Lexer.Token {
    return ArrayOrObject.keyValuePairInUri(
      value,
      index,
      NameOrIdentifier.entityNavigationProperty,
      Expressions.rootExpr,
    );
  }

  export function collectionNavPropInJSON(value: Utils.SourceArray, index: number): Lexer.Token {
    return ArrayOrObject.keyValuePairInUri(
      value,
      index,
      NameOrIdentifier.entityColNavigationProperty,
      rootExprCol,
    );
  }

  export function rootExprCol(value: Utils.SourceArray, index: number): Lexer.Token {
    const begin = Lexer.beginArray(value, index);
    if (begin === index) return;
    const start = index;
    index = begin;

    const items = [];
    let token = Expressions.rootExpr(value, index);
    if (token) {
      while (token) {
        items.push(token);
        index = token.next;

        const end = Lexer.endArray(value, index);
        if (end > index) {
          index = end;
          break;
        } else {
          const separator = Lexer.valueSeparator(value, index);
          if (separator === index) return;
          index = separator;

          token = Expressions.rootExpr(value, index);
          if (!token) return;
        }
      }
    } else {
      const end = Lexer.endArray(value, index);
      if (end === index) return;
      index = end;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Array);
  }

  export function primitiveLiteralInJSON(value: Utils.SourceArray, index: number): Lexer.Token {
    return (
      ArrayOrObject.stringInJSON(value, index) ||
      ArrayOrObject.numberInJSON(value, index) ||
      ArrayOrObject.booleanInJSON(value, index) ||
      ArrayOrObject.nullInJSON(value, index)
    );
  }

  export function stringInJSON(value: Utils.SourceArray, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    const start = index;
    index = mark;

    let char = ArrayOrObject.charInJSON(value, index);
    while (char > index) {
      index = char;
      char = ArrayOrObject.charInJSON(value, index);
    }

    mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    index = mark;

    return Lexer.tokenize(value, start, index, 'string', Lexer.TokenType.Literal);
  }

  export function charInJSON(value: Utils.SourceArray, index: number): number {
    const escape = Lexer.escape(value, index);
    if (escape > index) {
      if (Utils.equals(value, escape, '%2F')) return escape + 3;
      if (
        Utils.equals(value, escape, '/') ||
        Utils.equals(value, escape, 'b') ||
        Utils.equals(value, escape, 'f') ||
        Utils.equals(value, escape, 'n') ||
        Utils.equals(value, escape, 'r') ||
        Utils.equals(value, escape, 't')
      )
        return escape + 1;
      if (Utils.equals(value, escape, 'u') && Utils.required(value, escape + 1, Lexer.HEXDIG, 4, 4))
        return escape + 5;
      const escapeNext = Lexer.escape(value, escape);
      if (escapeNext > escape) return escapeNext;
      const mark = Lexer.quotationMark(value, escape);
      if (mark > escape) return mark;
    } else {
      const mark = Lexer.quotationMark(value, index);
      if (mark === index) return index + 1;
    }
  }

  export function numberInJSON(value: Utils.SourceArray, index: number): Lexer.Token {
    const token =
      PrimitiveLiteral.doubleValue(value, index) || PrimitiveLiteral.int64Value(value, index);
    if (token) {
      token.value = 'number';
      return token;
    }
  }

  export function booleanInJSON(value: Utils.SourceArray, index: number): Lexer.Token {
    if (Utils.equals(value, index, 'true'))
      return Lexer.tokenize(value, index, index + 4, 'boolean', Lexer.TokenType.Literal);
    if (Utils.equals(value, index, 'false'))
      return Lexer.tokenize(value, index, index + 5, 'boolean', Lexer.TokenType.Literal);
  }

  export function nullInJSON(value: Utils.SourceArray, index: number): Lexer.Token {
    if (Utils.equals(value, index, 'null'))
      return Lexer.tokenize(value, index, index + 4, 'null', Lexer.TokenType.Literal);
  }

  export function arrayOrObject(value: Utils.SourceArray, index: number): Lexer.Token {
    const token =
      ArrayOrObject.complexColInUri(value, index) ||
      ArrayOrObject.complexInUri(value, index) ||
      ArrayOrObject.rootExprCol(value, index) ||
      ArrayOrObject.primitiveColInUri(value, index);

    if (token)
      return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.ArrayOrObject);
  }
}

export default ArrayOrObject;
