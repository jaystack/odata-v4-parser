const expect = require('chai').expect;
const { PrimitiveLiteral } = require('../lib/primitiveLiteral');
const cases = require('./primitive-cases');

describe('Primitive literals from json', () => {
  cases.forEach(function(item, index, array) {
    const title = '#' + index + ' should parse ' + item['-Name'] + ': ' + item.Input;
    let resultName = "result";
    if (item.result === undefined) {
        resultName = "result_error";
        item['-FailAt'] = item['-FailAt'] || 0;
    }
    if (item[resultName] !== undefined) {
      it(title, () => {
        let source = new Uint8Array(new Buffer(item.Input));
        if (item[resultName].next === undefined) item[resultName].next = item.Input.length;
        if (item[resultName].raw === undefined) item[resultName].raw = item.Input;

        let literalFunctionName = getLiteralFunctionName(item["-Rule"] || 'primitiveLiteral');
        let literal = (PrimitiveLiteral[literalFunctionName] || PrimitiveLiteral.primitiveLiteral)(source, 0);
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
      return 'stringValue'
    case 'primitiveValue':
      return 'primitiveLiteral'
    default:
      return itemRule
  }
}

process.on("warning", warning => {
    console.log(warning.stack);
});