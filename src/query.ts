import Utils from './utils';
import Lexer from './lexer';
import PrimitiveLiteral from './primitiveLiteral';
import NameOrIdentifier from './nameOrIdentifier';
import Expressions from './expressions';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Query {
  export function queryOptions(
    value: Utils.SourceArray,
    index: number,
    metadataContext?: any,
  ): Lexer.Token {
    let token = Query.queryOption(value, index, metadataContext);
    if (!token) return;
    const start = index;
    index = token.next;

    const options = [];
    while (token) {
      options.push(token);
      // &
      if (value[index] !== 0x26) break;
      index++;

      token = Query.queryOption(value, index, metadataContext);
      if (!token) return;
      index = token.next;
    }

    return Lexer.tokenize(value, start, index, { options }, Lexer.TokenType.QueryOptions);
  }

  export function queryOption(
    value: Utils.SourceArray,
    index: number,
    metadataContext?: any,
  ): Lexer.Token {
    return (
      Query.systemQueryOption(value, index, metadataContext) ||
      Query.aliasAndValue(value, index) ||
      Query.customQueryOption(value, index)
    );
  }

  export function systemQueryOption(
    value: Utils.SourceArray,
    index: number,
    metadataContext?: any,
  ): Lexer.Token {
    return (
      Query.expand(value, index, metadataContext) ||
      Query.filter(value, index) ||
      Query.format(value, index) ||
      Query.id(value, index) ||
      Query.inlinecount(value, index) ||
      Query.orderby(value, index) ||
      Query.search(value, index) ||
      Query.select(value, index) ||
      Query.skip(value, index) ||
      Query.skiptoken(value, index) ||
      Query.top(value, index)
    );
  }

  export function customQueryOption(value: Utils.SourceArray, index: number): Lexer.Token {
    const key = NameOrIdentifier.odataIdentifier(value, index);
    if (!key) return;
    const start = index;
    index = key.next;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    while (value[index] !== 0x26 && index < value.length) index++;
    if (index === eq) return;

    return Lexer.tokenize(
      value,
      start,
      index,
      { key: key.raw, value: Utils.stringify(value, eq, index) },
      Lexer.TokenType.CustomQueryOption,
    );
  }

  export function id(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24id')) {
      index += 5;
    } else if (Utils.equals(value, index, '$id')) {
      index += 3;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    while (value[index] !== 0x26 && index < value.length) index++;
    if (index === eq) return;

    return Lexer.tokenize(
      value,
      start,
      index,
      Utils.stringify(value, eq, index),
      Lexer.TokenType.Id,
    );
  }

  export function expand(
    value: Utils.SourceArray,
    index: number,
    metadataContext?: any,
  ): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24expand')) {
      index += 9;
    } else if (Utils.equals(value, index, '$expand')) {
      index += 7;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const items = [];
    let token = Query.expandItem(value, index, metadataContext);
    if (!token) return;
    index = token.next;

    while (token) {
      items.push(token);

      const comma = Lexer.COMMA(value, index);
      if (comma) {
        index = comma;
        token = Query.expandItem(value, index, metadataContext);
        if (!token) return;
        index = token.next;
      } else break;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Expand);
  }

  export function expandItem(
    value: Utils.SourceArray,
    index: number,
    metadataContext?: any,
  ): Lexer.Token {
    const start = index;
    const star = Lexer.STAR(value, index);
    if (star) {
      index = star;
      const ref = Expressions.refExpr(value, index);
      if (ref) {
        index = ref.next;
        return Lexer.tokenize(value, start, index, { path: '*', ref }, Lexer.TokenType.ExpandItem);
      } else {
        const open = Lexer.OPEN(value, index);
        if (open) {
          index = open;
          const token = Query.levels(value, index);
          if (!token) return;
          index = token.next;

          const close = Lexer.CLOSE(value, index);
          if (!close) return;
          index = close;

          return Lexer.tokenize(
            value,
            start,
            index,
            { path: '*', levels: token },
            Lexer.TokenType.ExpandItem,
          );
        }
      }
    }

    const path = Query.expandPath(value, index, metadataContext);
    if (!path) return;
    index = path.next;

    const tokenValue: any = { path };

    const ref = Expressions.refExpr(value, index);
    if (ref) {
      index = ref.next;
      tokenValue.ref = ref;

      const open = Lexer.OPEN(value, index);
      if (open) {
        index = open;

        let option = Query.expandRefOption(value, index);
        if (!option) return;

        const refOptions = [];
        while (option) {
          refOptions.push(option);
          index = option.next;

          const semi = Lexer.SEMI(value, index);
          if (semi) {
            index = semi;

            option = Query.expandRefOption(value, index);
            if (!option) return;
          } else break;
        }

        const close = Lexer.CLOSE(value, index);
        if (!close) return;
        index = close;

        tokenValue.options = refOptions;
      }
    } else {
      const count = Expressions.countExpr(value, index);
      if (count) {
        index = count.next;
        tokenValue.count = count;

        const open = Lexer.OPEN(value, index);
        if (open) {
          index = open;

          let option = Query.expandCountOption(value, index);
          if (!option) return;

          const countOptions = [];
          while (option) {
            countOptions.push(option);
            index = option.next;

            const semi = Lexer.SEMI(value, index);
            if (semi) {
              index = semi;

              option = Query.expandCountOption(value, index);
              if (!option) return;
            } else break;
          }

          const close = Lexer.CLOSE(value, index);
          if (!close) return;
          index = close;
          tokenValue.options = countOptions;
        }
      } else {
        const open = Lexer.OPEN(value, index);
        if (open) {
          index = open;

          let option = Query.expandOption(value, index);
          if (!option) return;

          const options = [];
          while (option) {
            options.push(option);
            index = option.next;

            const semi = Lexer.SEMI(value, index);
            if (semi) {
              index = semi;

              option = Query.expandOption(value, index);
              if (!option) return;
            } else break;
          }

          const close = Lexer.CLOSE(value, index);
          if (!close) return;
          index = close;
          tokenValue.options = options;
        }
      }
    }

    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.ExpandItem);
  }

  export function expandCountOption(value: Utils.SourceArray, index: number): Lexer.Token {
    return Query.filter(value, index) || Query.search(value, index);
  }

  export function expandRefOption(value: Utils.SourceArray, index: number): Lexer.Token {
    return (
      Query.expandCountOption(value, index) ||
      Query.orderby(value, index) ||
      Query.skip(value, index) ||
      Query.top(value, index) ||
      Query.inlinecount(value, index)
    );
  }

  export function expandOption(value: Utils.SourceArray, index: number): Lexer.Token {
    return (
      Query.expandRefOption(value, index) ||
      Query.select(value, index) ||
      Query.expand(value, index) ||
      Query.levels(value, index)
    );
  }

  export function expandPath(
    value: Utils.SourceArray,
    index: number,
    metadataContext?: any,
  ): Lexer.Token {
    const start = index;
    const path = [];

    const token =
      NameOrIdentifier.qualifiedEntityTypeName(value, index, metadataContext) ||
      NameOrIdentifier.qualifiedComplexTypeName(value, index, metadataContext);

    if (token) {
      index = token.next;
      path.push(token);
      if (value[index] !== 0x2f) return;
      index++;
      metadataContext = token.value.metadata;
      delete token.value.metadata;
    }

    let complex =
      NameOrIdentifier.complexProperty(value, index, metadataContext) ||
      NameOrIdentifier.complexColProperty(value, index, metadataContext);
    while (complex) {
      if (value[complex.next] === 0x2f) {
        index = complex.next + 1;
        path.push(complex);

        const complexTypeName = NameOrIdentifier.qualifiedComplexTypeName(
          value,
          index,
          metadataContext,
        );
        if (complexTypeName) {
          if (value[complexTypeName.next] === 0x2f) {
            index = complexTypeName.next + 1;
            path.push(complexTypeName);
          }
          metadataContext = complexTypeName.value.metadata;
          delete complexTypeName.value.metadata;
        }

        complex =
          NameOrIdentifier.complexProperty(value, index, metadataContext) ||
          NameOrIdentifier.complexColProperty(value, index, metadataContext);
      } else break;
    }

    const nav = NameOrIdentifier.navigationProperty(value, index, metadataContext);

    if (!nav) return;
    index = nav.next;
    path.push(nav);
    metadataContext = nav.metadata;
    delete nav.metadata;

    if (value[index] === 0x2f) {
      const typeName = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
      if (typeName) {
        index = typeName.next;
        path.push(typeName);
        metadataContext = typeName.value.metadata;
        delete typeName.value.metadata;
      }
    }

    return Lexer.tokenize(value, start, index, path, Lexer.TokenType.ExpandPath);
  }

  export function search(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24search')) {
      index += 9;
    } else if (Utils.equals(value, index, '$search')) {
      index += 7;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const expr = Query.searchExpr(value, index);
    if (!expr) return;
    index = expr.next;

    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Search);
  }

  export function searchExpr(value: Utils.SourceArray, index: number): Lexer.Token {
    const token = Query.searchParenExpr(value, index) || Query.searchTerm(value, index);

    if (!token) return;
    const start = index;
    index = token.next;

    const expr = Query.searchAndExpr(value, index) || Query.searchOrExpr(value, index);

    if (expr) {
      const left = Lexer.clone(token);
      token.next = expr.value.next;
      token.value = {
        left: left,
        right: expr.value,
      };
      token.type = expr.type;
      token.raw = Utils.stringify(value, token.position, token.next);

      if (
        token.type === Lexer.TokenType.SearchAndExpression &&
        token.value.right.type === Lexer.TokenType.SearchOrExpression
      ) {
        token.value.left = Lexer.tokenize(
          value,
          token.value.left.position,
          token.value.right.value.left.next,
          {
            left: token.value.left,
            right: token.value.right.value.left,
          },
          token.type,
        );
        token.type = token.value.right.type;
        token.value.right = token.value.right.value.right;
      }
    }

    return token;
  }

  export function searchTerm(value: Utils.SourceArray, index: number): Lexer.Token {
    return (
      Query.searchNotExpr(value, index) ||
      Query.searchPhrase(value, index) ||
      Query.searchWord(value, index)
    );
  }

  export function searchNotExpr(value: Utils.SourceArray, index: number): Lexer.Token {
    let rws = Lexer.RWS(value, index);
    if (!Utils.equals(value, rws, 'NOT')) return;
    const start = index;
    index = rws + 3;
    rws = Lexer.RWS(value, index);
    if (rws === index) return;
    index = rws;
    const expr = Query.searchPhrase(value, index) || Query.searchWord(value, index);
    if (!expr) return;
    index = expr.next;

    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.SearchNotExpression);
  }

  export function searchOrExpr(value: Utils.SourceArray, index: number): Lexer.Token {
    let rws = Lexer.RWS(value, index);
    if (rws === index || !Utils.equals(value, rws, 'OR')) return;
    const start = index;
    index = rws + 2;
    rws = Lexer.RWS(value, index);
    if (rws === index) return;
    index = rws;
    const token = Query.searchExpr(value, index);
    if (!token) return;
    index = token.next;

    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.SearchOrExpression);
  }

  export function searchAndExpr(value: Utils.SourceArray, index: number): Lexer.Token {
    let rws = Lexer.RWS(value, index);
    if (rws === index || !Utils.equals(value, rws, 'AND')) return;
    const start = index;
    index = rws + 3;
    rws = Lexer.RWS(value, index);
    if (rws === index) return;
    index = rws;
    const token = Query.searchExpr(value, index);
    if (!token) return;
    index = token.next;

    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.SearchAndExpression);
  }

  export function searchPhrase(value: Utils.SourceArray, index: number): Lexer.Token {
    let mark = Lexer.quotationMark(value, index);
    if (mark === index) return;
    const start = index;
    index = mark;

    const valueStart = index;
    let ch = Lexer.qcharNoAMPDQUOTE(value, index);
    while (ch > index && !Lexer.OPEN(value, index) && !Lexer.CLOSE(value, index)) {
      index = ch;
      ch = Lexer.qcharNoAMPDQUOTE(value, index);
    }
    const valueEnd = index;

    mark = Lexer.quotationMark(value, index);
    if (!mark) return;
    index = mark;

    return Lexer.tokenize(
      value,
      start,
      index,
      Utils.stringify(value, valueStart, valueEnd),
      Lexer.TokenType.SearchPhrase,
    );
  }

  export function searchWord(value: Utils.SourceArray, index: number): Lexer.Token {
    const next = Utils.required(value, index, Lexer.ALPHA, 1);
    if (!next) return;
    const start = index;
    index = next;

    const token = Lexer.tokenize(value, start, index, null, Lexer.TokenType.SearchWord);
    token.value = token.raw;
    return token;
  }

  export function searchParenExpr(value: Utils.SourceArray, index: number): Lexer.Token {
    const open = Lexer.OPEN(value, index);
    if (!open) return;
    const start = index;
    index = open;
    index = Lexer.BWS(value, index);

    const expr = Query.searchExpr(value, index);
    if (!expr) return;
    index = expr.next;

    index = Lexer.BWS(value, index);
    const close = Lexer.CLOSE(value, index);
    if (!close) return;
    index = close;

    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.SearchParenExpression);
  }

  export function levels(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24levels')) {
      index += 9;
    } else if (Utils.equals(value, index, '$levels')) {
      index += 7;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    let level;
    if (Utils.equals(value, index, 'max')) {
      level = 'max';
      index += 3;
    } else {
      const token = PrimitiveLiteral.int32Value(value, index);
      if (!token) return;
      level = token.raw;
      index = token.next;
    }

    return Lexer.tokenize(value, start, index, level, Lexer.TokenType.Levels);
  }

  export function filter(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24filter')) {
      index += 9;
    } else if (Utils.equals(value, index, '$filter')) {
      index += 7;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const expr = Expressions.boolCommonExpr(value, index);
    if (!expr) return;
    index = expr.next;

    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Filter);
  }

  export function orderby(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24orderby')) {
      index += 10;
    } else if (Utils.equals(value, index, '$orderby')) {
      index += 8;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const items = [];
    let token = Query.orderbyItem(value, index);
    if (!token) return;
    index = token.next;

    while (token) {
      items.push(token);

      const comma = Lexer.COMMA(value, index);
      if (comma) {
        index = comma;
        token = Query.orderbyItem(value, index);
        if (!token) return;
        index = token.next;
      } else break;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.OrderBy);
  }

  export function orderbyItem(value: Utils.SourceArray, index: number): Lexer.Token {
    const expr = Expressions.commonExpr(value, index);
    if (!expr) return;
    const start = index;
    index = expr.next;

    let direction = 1;
    const rws = Lexer.RWS(value, index);
    if (rws > index) {
      index = rws;
      if (Utils.equals(value, index, 'asc')) index += 3;
      else if (Utils.equals(value, index, 'desc')) {
        index += 4;
        direction = -1;
      } else return;
    }

    return Lexer.tokenize(value, start, index, { expr, direction }, Lexer.TokenType.OrderByItem);
  }

  export function skip(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24skip')) {
      index += 7;
    } else if (Utils.equals(value, index, '$skip')) {
      index += 5;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const token = PrimitiveLiteral.int32Value(value, index);
    if (!token) return;
    index = token.next;

    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Skip);
  }

  export function top(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24top')) {
      index += 6;
    } else if (Utils.equals(value, index, '$top')) {
      index += 4;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const token = PrimitiveLiteral.int32Value(value, index);
    if (!token) return;
    index = token.next;

    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Top);
  }

  export function format(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24format')) {
      index += 9;
    } else if (Utils.equals(value, index, '$format')) {
      index += 7;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    let format;
    if (Utils.equals(value, index, 'atom')) {
      format = 'atom';
      index += 4;
    } else if (Utils.equals(value, index, 'json')) {
      format = 'json';
      index += 4;
    } else if (Utils.equals(value, index, 'xml')) {
      format = 'xml';
      index += 3;
    }

    if (format) return Lexer.tokenize(value, start, index, { format }, Lexer.TokenType.Format);
  }

  export function inlinecount(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24count')) {
      index += 8;
    } else if (Utils.equals(value, index, '$count')) {
      index += 6;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const token = PrimitiveLiteral.booleanValue(value, index);
    if (!token) return;
    index = token.next;

    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.InlineCount);
  }

  export function select(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24select')) {
      index += 9;
    } else if (Utils.equals(value, index, '$select')) {
      index += 7;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const items = [];
    let token = Query.selectItem(value, index);
    if (!token) return;
    while (token) {
      items.push(token);
      index = token.next;

      const comma = Lexer.COMMA(value, index);
      if (comma) {
        index = comma;
        token = Query.selectItem(value, index);
        if (!token) return;
      } else break;
    }

    return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Select);
  }

  export function selectItem(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    let item;
    const op = Query.allOperationsInSchema(value, index);
    const star = Lexer.STAR(value, index);
    if (op > index) {
      item = { namespace: Utils.stringify(value, index, op - 2), value: '*' };
      index = op;
    } else if (star) {
      item = { value: '*' };
      index = star;
    } else {
      item = {};
      const name =
        NameOrIdentifier.qualifiedEntityTypeName(value, index) ||
        NameOrIdentifier.qualifiedComplexTypeName(value, index);

      if (name && value[name.next] !== 0x2f) return;
      else if (name && value[name.next] === 0x2f) {
        index++;
        item.name = name;
      }

      const select =
        Query.selectProperty(value, index) ||
        Query.qualifiedActionName(value, index) ||
        Query.qualifiedFunctionName(value, index);
      if (!select) return;
      index = select.next;

      item = name ? { name, select } : select;
    }

    if (index > start) return Lexer.tokenize(value, start, index, item, Lexer.TokenType.SelectItem);
  }

  export function allOperationsInSchema(value: Utils.SourceArray, index: number): number {
    const namespaceNext = NameOrIdentifier.namespace(value, index);
    const star = Lexer.STAR(value, namespaceNext + 1);
    if (namespaceNext > index && value[namespaceNext] === 0x2e && star) return star;
    return index;
  }

  export function selectProperty(value: Utils.SourceArray, index: number): Lexer.Token {
    const token =
      Query.selectPath(value, index) ||
      NameOrIdentifier.primitiveProperty(value, index) ||
      NameOrIdentifier.primitiveColProperty(value, index) ||
      NameOrIdentifier.navigationProperty(value, index);
    if (!token) return;
    const start = index;
    index = token.next;

    if (token.type === Lexer.TokenType.SelectPath) {
      if (value[index] === 0x2f) {
        index++;
        const prop = Query.selectProperty(value, index);

        if (!prop) return;
        const path = Lexer.clone(token);
        token.next = prop.next;
        token.raw = Utils.stringify(value, start, token.next);
        token.value = { path, next: prop };
      }
    }

    return token;
  }

  export function selectPath(value: Utils.SourceArray, index: number): Lexer.Token {
    const token =
      NameOrIdentifier.complexProperty(value, index) ||
      NameOrIdentifier.complexColProperty(value, index);

    if (!token) return;
    const start = index;
    index = token.next;

    let tokenValue: any = token;
    if (value[index] === 0x2f) {
      const name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1);
      if (name) {
        index = name.next;
        tokenValue = { prop: token, name };
      }
    }

    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.SelectPath);
  }

  export function qualifiedActionName(value: Utils.SourceArray, index: number): Lexer.Token {
    const namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext === index || value[namespaceNext] !== 0x2e) return;
    const start = index;
    index = namespaceNext + 1;

    const action = NameOrIdentifier.action(value, index);
    if (!action) return;
    action.value.namespace = Utils.stringify(value, start, namespaceNext);

    return Lexer.tokenize(value, start, action.next, action, Lexer.TokenType.Action);
  }

  export function qualifiedFunctionName(value: Utils.SourceArray, index: number): Lexer.Token {
    const namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext === index || value[namespaceNext] !== 0x2e) return;
    const start = index;
    index = namespaceNext + 1;

    const fn = NameOrIdentifier.odataFunction(value, index);
    if (!fn) return;
    fn.value.namespace = Utils.stringify(value, start, namespaceNext);
    index = fn.next;
    const tokenValue: any = { name: fn };

    const open = Lexer.OPEN(value, index);
    if (open) {
      index = open;
      tokenValue.parameters = [];
      const param = Expressions.parameterName(value, index);
      if (!param) return;

      while (param) {
        index = param.next;
        tokenValue.parameters.push(param);

        const comma = Lexer.COMMA(value, index);
        if (comma) {
          index = comma;
          const param = Expressions.parameterName(value, index);
          if (!param) return;
        } else break;
      }

      const close = Lexer.CLOSE(value, index);
      if (!close) return;
      index = close;
    }

    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.Function);
  }

  export function skiptoken(value: Utils.SourceArray, index: number): Lexer.Token {
    const start = index;
    if (Utils.equals(value, index, '%24skiptoken')) {
      index += 12;
    } else if (Utils.equals(value, index, '$skiptoken')) {
      index += 10;
    } else return;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    let ch = Lexer.qcharNoAMP(value, index);
    if (!ch) return;
    const valueStart = index;

    while (ch > index) {
      index = ch;
      ch = Lexer.qcharNoAMP(value, index);
    }

    return Lexer.tokenize(
      value,
      start,
      index,
      Utils.stringify(value, valueStart, index),
      Lexer.TokenType.SkipToken,
    );
  }

  export function aliasAndValue(value: Utils.SourceArray, index: number): Lexer.Token {
    const alias = Expressions.parameterAlias(value, index);
    if (!alias) return;
    const start = index;
    index = alias.next;

    const eq = Lexer.EQ(value, index);
    if (!eq) return;
    index = eq;

    const paramValue = Expressions.parameterValue(value, index);
    if (!paramValue) return;
    index = paramValue.next;

    return Lexer.tokenize(
      value,
      start,
      index,
      {
        alias,
        value: paramValue,
      },
      Lexer.TokenType.AliasAndValue,
    );
  }
}

export default Query;
