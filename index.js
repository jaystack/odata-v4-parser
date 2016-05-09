var schema = require('./schema2.json');
var edmx = new (require('odata-v4-metadata').Edm.Edmx)(schema);
var parser = require('./lib/parser');

console.log(parser.resourcePath('/Categories/Default.SFunction1()', { metadata: edmx })
    .value.navigation.value.path//.value.operation.value.call
    //.value.resource.value.import
);

setInterval(function(){}, 60000);