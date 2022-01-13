// eslint-disable-next-line @typescript-eslint/no-var-requires
const Parser = require('../dist/parser').Parser;

describe('Parser', () => {
  it('should instantiate odata parser', () => {
    const parser = new Parser();
    const ast = parser.filter("Categories/all(d:d/Title eq 'alma')");
    expect(ast.value.value.value.value.next.value.value.predicate.value.value.right.value).toEqual(
      'Edm.String',
    );
  });

  it('should parse query string', () => {
    const parser = new Parser();
    const ast = parser.query("$filter=Title eq 'alma'");
    expect(ast.value.options[0].type).toEqual('Filter');
  });

  it('should parse multiple orderby params', () => {
    const parser = new Parser();
    const ast = parser.query('$orderby=foo,bar');
    expect(ast.value.options[0].value.items[0].raw).toEqual('foo');
    expect(ast.value.options[0].value.items[1].raw).toEqual('bar');
  });

  it('should parse custom query options', () => {
    const parser = new Parser();
    const ast = parser.query('foo=123&bar=foobar');
    expect(ast.value.options[0].value.key).toEqual('foo');
    expect(ast.value.options[0].value.value).toEqual('123');
    expect(ast.value.options[1].value.key).toEqual('bar');
    expect(ast.value.options[1].value.value).toEqual('foobar');
  });

  it('should throw error parsing invalid custom query options', () => {
    const parser = new Parser();
    let error = false;
    try {
      const ast = parser.query('$foo=123');
      error = true;
    } catch (err) {}
    expect(error).toBeFalsy();
  });
});
