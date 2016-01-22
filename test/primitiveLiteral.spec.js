/// <reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var expect = chai.expect;
var PrimitiveLiteral = require('../src/primitiveLiteral');
var example_cases = require('./example-cases');
var cases = require('./cases');
describe('Primitive literals from example json', function () {
    example_cases.forEach(function (item, index, array) {
        var title = 'should parse ' + item['-Name'] + ' #' + index;
        it(title, function () {
            var source = new Uint8Array(new Buffer(item.Input));
            expect(PrimitiveLiteral.primitiveLiteral(source, 0)).to.deep.equal(item.result);
        });
    });
});
describe('Primitive literals from json', function () {
    cases.forEach(function (item, index, array) {
        var title = '#' + index + ' should parse ' + item['-Name'];
        if (item.result !== undefined) {
            it(title, function () {
                var source = new Uint8Array(new Buffer(item.Input));
                if (item.result.next === undefined)
                    item.result.next = item.Input.length;
                if (item.result.raw === undefined)
                    item.result.raw = item.Input;
                if (item['-FailAt'] !== undefined) {
                    console.log(item["-Rule"]);
                    var literal_1 = PrimitiveLiteral[item["-Rule"]](source, 0);
                    expect(literal_1).to.be.undefined;
                    return;
                }
                var literal = PrimitiveLiteral.primitiveLiteral(source, 0);
                expect(literal).to.deep.equal(item.result);
            });
        }
    });
});
