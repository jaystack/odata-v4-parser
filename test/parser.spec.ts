/// <reference path="../typings/tsd.d.ts"/>
import * as chai from 'chai';
var expect = chai.expect;

import { Parser } from '../lib/parser';
import * as PrimitiveLiteral from '../lib/primitiveLiteral';
import * as NameOrIdentifier from '../lib/nameOrIdentifier';
import * as Expressions from '../lib/expressions';

describe('Parser', () => {
	it('should instantiate odata parser', () => {
		var parser = new Parser();
		var ast = parser.filter("Categories/all(d:d/Title eq 'alma')");
		expect(ast.value.value.value.value.value.value.next.value.value.predicate.value.value.right.value).to.equal('Edm.String');
	});
});
