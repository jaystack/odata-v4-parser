"use strict";
var chai = require('chai');
var expect = chai.expect;
var PrimitiveLiteral = require('../src/primitiveLiteral');
describe('Primitive literals', function () {
    describe('Edm.Binary', function () {
        it('should parse Binary - foobar', function () {
            var source = new Uint8Array(new Buffer("binary'Zm9vYmFy'"));
            expect(PrimitiveLiteral.primitiveLiteral(source, 0)).to.deep.equal({
                next: 16,
                position: 0,
                raw: "binary'Zm9vYmFy'",
                type: "Literal",
                value: "Edm.Binary"
            });
        });
        it('should parse Binary - foo', function () {
            var source = new Uint8Array(new Buffer("binary'Zm9v'"));
            expect(PrimitiveLiteral.primitiveLiteral(source, 0)).to.deep.equal({
                next: 12,
                position: 0,
                raw: "binary'Zm9v'",
                type: "Literal",
                value: "Edm.Binary"
            });
        });
    });
});
//# sourceMappingURL=primitiveLiteral.spec.js.map