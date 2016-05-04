var parser = require('./lib/parser');
var defineEntities = require('odata-v4-service-metadata/lib/defineEntities').defineEntities;
var Edm = require('odata-v4-metadata').Edm;

var edmx = new Edm.Edmx(require('./schema2.json'));
console.log('EDMX', edmx.dataServices);

//console.log(parser.resourcePath('/Products(Id=1)/Name', { metadata: edmx }).value.navigation.value.path.value.navigation.value.path.value);
/*console.log(parser.resourcePath('/UserProfiles(Id=1)/Location/Address', { metadata: edmx })
    .value.navigation.value.path.value//.navigation//.value.path.value//.navigation.value//.path.value
    );*/
    
/*console.log(parser.resourcePath('/Articles(1)/Default.GetTitles(id=1)(314)', { metadata: edmx })
    .value.navigation.value.path.value.navigation.value//.path.value
);*/

console.log(parser.resourcePath('/Categories(1)/NS.TopArticles(top=5)(314)/NS.RelevantCategories(dept=3)(42)/Tags', { metadata: edmx })
); 

setInterval(function(){}, 60000);