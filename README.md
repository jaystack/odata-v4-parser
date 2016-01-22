# OData v4 Parser

OData v4 parser based on OASIS Standard OData v4 ABNF grammar

## How to build

Simply just use ```$ gulp build```
Run TDD tests use ```$ gulp tdd```

## How to use

Parser class instance:

```javascript
var parser = new (require('./lib/parser')).Parser)();
parser.filter("Title eq 'Article1'");
```

Low-level functional:

```javascript
require('./lib/expressions').boolCommonExpr(new Uint8Array(new Buffer("contains(@word,Title)")), 0);
require('./lib/json').arrayOrObject(new Uint8Array(new Buffer('{"a":1}')), 0);
require('./lib/expressions').commonExpr(new Uint8Array(new Buffer('Items/all(d:d/Quantity gt 100)')), 0);
```

## TODO

* unit testing
* code coverage
* $expand
* path
* use metadata for correct OData identifier type detection (complex types, navigation properties, etc.)
