const expect = require('chai').expect;

const Parser = require('../lib/parser').Parser;
const PrimitiveLiteral = require('../lib/primitiveLiteral');
const NameOrIdentifier = require('../lib/nameOrIdentifier');
const Expressions = require('../lib/expressions');

describe('Parser', () => {
	it('should instantiate odata parser', () => {
		var parser = new Parser();
		var ast = parser.filter("Categories/all(d:d/Title eq 'alma')");
		expect(ast.value.value.value.value.next.value.value.predicate.value.value.right.value).to.equal('Edm.String');
	});

	it('should parse query string', () => {
		var parser = new Parser();
		var ast = parser.query("$filter=Title eq 'alma'");
		expect(ast.value.options[0].type).to.equal('Filter');
	});
});
