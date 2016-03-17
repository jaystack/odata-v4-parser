/// <reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var expect = chai.expect;
var PrimitiveLiteral = require('../lib/primitiveLiteral');
var cases = require('./primitive-cases');
describe('Primitive literals from json', function () {
    cases.forEach(function (item, index, array) {
        var title = '#' + index + ' should parse ' + item['-Name'] + ': ' + item.Input;
        var resultName = "result";
        if (item.result === undefined) {
            resultName = "result_error";
            item['-FailAt'] = item['-FailAt'] || 0;
        }
        if (item[resultName] !== undefined) {
            it(title, function () {
                var source = new Uint8Array(new Buffer(item.Input));
                if (item[resultName].next === undefined)
                    item[resultName].next = item.Input.length;
                if (item[resultName].raw === undefined)
                    item[resultName].raw = item.Input;
                var literalFunctionName = getLiteralFunctionName(item["-Rule"] || 'primitiveLiteral');
                var literal = (PrimitiveLiteral[literalFunctionName] || PrimitiveLiteral.primitiveLiteral)(source, 0);
                if (item['-FailAt'] !== undefined) {
                    expect(literal).to.be.undefined;
                    return;
                }
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
