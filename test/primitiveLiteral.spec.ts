/// <reference path="../typings/tsd.d.ts"/>
import * as chai from 'chai';
var expect = chai.expect;

import * as PrimitiveLiteral from '../src/primitiveLiteral';
const example_cases = require('./example-cases'); 
const cases = require('./cases'); 

describe('Primitive literals from example json', () => {
  example_cases.forEach(function (item, index, array) {
    const title = 'should parse ' + item['-Name']  + ' #' + index;
    it(title, () => {
      let source = new Uint8Array(new Buffer(item.Input));
      expect(PrimitiveLiteral.primitiveLiteral(source, 0)).to.deep.equal(item.result);
    });
  });
});
 
describe('Primitive literals from json', () => {
  cases.forEach(function (item, index, array) {
    const title = '#' + index + ' should parse ' + item['-Name'];
    if(item.result !== undefined) {
      it(title, () => {
        let source = new Uint8Array(new Buffer(item.Input));
        if( item.result.next === undefined ) item.result.next = item.Input.length;
        if( item.result.raw === undefined ) item.result.raw = item.Input;
        
        if( item['-FailAt'] !== undefined ) {
          console.log(item["-Rule"])
          let literal = PrimitiveLiteral[item["-Rule"]](source, 0);
          expect(literal).to.be.undefined;
          return;
        } 
        let literal = PrimitiveLiteral.primitiveLiteral(source, 0);
        expect(literal).to.deep.equal(item.result);
      }); 
    }
  });  
}); 
   
   
   
   
  
  
   
