/// <reference path="../typings/tsd.d.ts"/>
import * as chai from 'chai';
var expect = chai.expect;

import * as PrimitiveLiteral from '../src/primitiveLiteral';
const cases = require('./primitive-cases');

describe('Primitive literals from json', () => {
  cases.forEach(function(item, index, array) {
    const title = '#' + index + ' should parse ' + item['-Name'];
    let resultName = "result";
    if (item.result === undefined) { resultName = "result_error"; }
    if (item[resultName] !== undefined) {
      it(title, () => {
        let source = new Uint8Array(new Buffer(item.Input));
        if (item[resultName].next === undefined) item[resultName].next = item.Input.length;
        if (item[resultName].raw === undefined) item[resultName].raw = item.Input;

        if (item['-FailAt'] !== undefined) {
          let literalFunctionName = getLiteralFunctionName(item["-Rule"]);
          let literal = PrimitiveLiteral[literalFunctionName](source, 0);
          expect(literal).to.be.undefined;
          return;
        }
        let literal = PrimitiveLiteral.primitiveLiteral(source, 0);
        expect(literal).to.deep.equal(item[resultName]);
      });
    }
  });
});

function getLiteralFunctionName(itemRule) {
  switch (itemRule) {
    case 'string':
      return 'stringValue'
    case 'primitiveValue':
      return 'primitiveLiteral'
    default:
      return itemRule
  }
}