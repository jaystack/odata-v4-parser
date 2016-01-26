/// <reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var expect = chai.expect;
var PrimitiveLiteral = require('../src/primitiveLiteral');
var cases = require('./primitive-cases');
describe('Primitive literals from json', function () {
    cases.forEach(function (item, index, array) {
        var title = '#' + index + ' should parse ' + item['-Name'];
        var resultName = "result";
        if (item.result === undefined) {
            resultName = "result_error";
        }
        if (item[resultName] !== undefined) {
            it(title, function () {
                var source = new Uint8Array(new Buffer(item.Input));
                if (item[resultName].next === undefined)
                    item[resultName].next = item.Input.length;
                if (item[resultName].raw === undefined)
                    item[resultName].raw = item.Input;
                if (item['-FailAt'] !== undefined) {
                    var literalFunctionName = getLiteralFunctionName(item["-Rule"]);
                    var literal_1 = PrimitiveLiteral[literalFunctionName](source, 0);
                    expect(literal_1).to.be.undefined;
                    return;
                }
                var literal = PrimitiveLiteral.primitiveLiteral(source, 0);
                expect(literal).to.deep.equal(item[resultName]);
            });
        }
    });
});
function getLiteralFunctionName(itemRule) {
    switch (itemRule) {
        case 'string':
            return 'stringValue';
        case 'primitiveValue':
            return 'primitiveLiteral';
        default:
            return itemRule;
    }
}
