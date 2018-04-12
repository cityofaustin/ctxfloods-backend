const _ = require('lodash');
const fs = require('fs');
const csv = require('csv');
const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

const anonLokka = new Lokka({ transport: new HttpTransport('http://localhost:5000/graphql') });
let lokka;

anonLokka.mutate(`
    ($email:String!, $password:String!) {
      authenticate(input: {email: $email, password: $password}) {
        jwtToken
      }
    }
  `,
  {
    email: 'superadmin@flo.ods',
    password: 'texasfloods',
  }
).then(response => {
  const headers = {
    Authorization: 'Bearer ' + response.authenticate.jwtToken,
  };
  lokka = new Lokka({
    transport: new HttpTransport('http://localhost:5000/graphql', { headers }),
  });
  debugger;
}).then(() => {

  fs.readFile(
    'populateDB/data/crossings.csv', 'utf8',
    (err, data) => {
      csv.parse(data, {columns: true}, (err, data) => {
        _.forEach(data, crossing => {
          lokka.mutate(`($name:String!, $communityId:Int!, $legacyId:Int, $humanAddress:String!, $latitude:Float!, $longitude:Float!, $description:String) {
            newCrossing(input: {name:$name, communityId:$communityId, legacyId:$legacyId, humanAddress:$humanAddress, longitude:$longitude, latitude:$latitude, description:$description}) {
              crossing {
                id
                legacyId
              }
            }
          }`,
          {
            name: crossing.name,
            communityId: crossing.communityId,
            legacyId: crossing.legacyId,
            humanAddress: crossing.humanAddress,
            longitude: crossing.longitude,
            latitude: crossing.latitude,
            description: crossing.description
          }).then(response => {
            console.log(response);
          }).catch(err => {
            debugger;
          });
        });
      });
    }
  );

});


