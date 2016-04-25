/// <reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var expect = chai.expect;
var parser_1 = require('../lib/parser');
describe('Parser', function () {
    it('should instantiate odata parser', function () {
        var parser = new parser_1.Parser();
        var ast = parser.filter("Categories/all(d:d/Title eq 'alma')");
        expect(ast.value.value.value.value.next.value.value.predicate.value.value.right.value).to.equal('Edm.String');
    });
    it('should parse query string', function () {
        var parser = new parser_1.Parser();
        var ast = parser.query("$filter=Title eq 'alma'");
        expect(ast.value.options[0].type).to.equal('Filter');
    });
});
