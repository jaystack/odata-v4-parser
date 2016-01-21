/// <reference path="../typings/tsd.d.ts"/>
import * as chai from 'chai';
var expect = chai.expect;

import * as PrimitiveLiteral from '../src/primitiveLiteral';

describe('Primitive literals', () => {
	describe('Edm.Binary', () => {
		it('should parse Binary - foobar', () => {
			let source = new Uint8Array(new Buffer("binary'Zm9vYmFy'"));
			expect(PrimitiveLiteral.primitiveLiteral(source, 0)).to.deep.equal({
				next: 16,
				position: 0,
				raw: "binary'Zm9vYmFy'",
				type: "Literal",
				value: "Edm.Binary"
			});
		});

		it('should parse Binary - foo', () => {
			let source = new Uint8Array(new Buffer("binary'Zm9v'"));
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
