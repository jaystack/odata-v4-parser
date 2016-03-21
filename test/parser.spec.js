/// <reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var expect = chai.expect;
var parser_1 = require('../lib/parser');
var metadata = require('./metadata.json');
describe('Parser', function () {
    it('should instantiate odata parser with metadata', function () {
        var parser = new parser_1.Parser(metadata);
        var ast = parser.filter("Categories/all(d:d/Title eq 'almafa')");
    });
});
