/// <reference path="../typings/tsd.d.ts"/>
import * as chai from 'chai';
var expect = chai.expect;

import { Parser } from '../lib/parser';
import * as NameOrIdentifier from '../lib/nameOrIdentifier';
import { Edm } from 'odata-metadata';
const metadata:any = require('./metadata.json');

describe('Parser', () => {
	it('should instantiate odata parser with metadata', () => {
		var parser = new Parser(metadata);
		var ast = parser.filter("Categories/all(d:d/Title eq 'almafa')");
	});
});
