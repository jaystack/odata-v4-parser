var parser = require('./lib/parser');
var defineEntities = require('odata-v4-service-metadata/lib/defineEntities').defineEntities;
var Edm = require('odata-v4-metadata').Edm;

var edmx = new Edm.Edmx(require('./schema2.json'));
console.log('EDMX', edmx.dataServices.schemas[1].entityContainer[0]);
console.log('EDMX', edmx.dataServices.schemas[1].functions);

//console.log(parser.resourcePath('/Products(Id=1)/Name', { metadata: edmx }).value.navigation.value.path.value.navigation.value.path.value);
/*console.log(parser.resourcePath('/UserProfiles(Id=1)/Location/Address', { metadata: edmx })
    .value.navigation.value.path.value//.navigation//.value.path.value//.navigation.value//.path.value
    );*/
    
/*console.log(parser.resourcePath('/Articles(1)/Default.GetTitles(id=1)(314)', { metadata: edmx })
    .value.navigation.value.path.value.navigation.value//.path.value
);*/

console.log(parser.resourcePath("/SFunction2(p1=@p1,p2=@p2,p3=@p3)", { metadata: edmx })
    //
);

/*console.log(parser.resourcePath("/Categories/JayData.Test.CommonItems.Entities.Article/$count", { metadata: edmx })
    .value.navigation.value
);*/

setInterval(function(){}, 60000);