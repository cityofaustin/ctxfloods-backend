const fs = require('fs');
const csv = require('csv');
const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

async function getToken(email, password) {
  const anonLokka = new Lokka({ transport: new HttpTransport('http://localhost:5000/graphql') });

  const response = await anonLokka.send(
    `
    mutation($email:String!, $password:String!) {
      authenticate(input: {email: $email, password: $password}) {
        jwtToken
      }
    }
  `,
    {
      email: email,
      password: password,
    },
  );

  return response.authenticate.jwtToken;
}

async function addCrossing(lokka, crossing) {
  const response = await lokka.send(
    `
    mutation($name:String!, $communityId:Int!, $legacyId:Int, $humanAddress:String!, $latitude:Float!, $longitude:Float!, $description:String) {
      newCrossing(input: {name:$name, communityId:$communityId, legacyId:$legacyId, humanAddress:$humanAddress, longitude:$longitude, latitude:$latitude, description:$description}) {
        crossing {
          id
          legacyId
        }
      }
    }
  `,
    {
      name: crossing.name,
      communityId: crossing.communityId,
      legacyId: crossing.legacyId,
      humanAddress: crossing.humanAddress,
      longitude: crossing.longitude,
      latitude: crossing.latitude,
      description: crossing.description || ''
    },
  );

  return response.newCrossing.crossing;
}

async function addCrossingToCommunity(lokka, crossingId, communityId) {
  const response = await lokka.send(
    `
    mutation($crossingId:Int!, $communityId:Int!) {
      addCrossingToCommunity(input: {crossingId:$crossingId, communityId:$communityId}) {
        crossing {
          id
          legacyId
        }
      }
    }
  `,
    {
      crossingId: crossingId,
      communityId: communityId,
    },
  );

  return response.addCrossingToCommunity.crossing;
}

async function processCrossings(crossings) {
  const token = await getToken('superadmin@flo.ods', 'texasfloods');

  const headers = {
    Authorization: 'Bearer ' + token,
  };
  const lokka = new Lokka({
    transport: new HttpTransport('http://localhost:5000/graphql', { headers }),
  });

  let legacyToNewMap = {};
  for (crossing of crossings) {
    const newId = legacyToNewMap[crossing.legacyId];

    if (!newId) {
      const newCrossing =  await addCrossing(lokka, crossing);
      legacyToNewMap[newCrossing.legacyId] = newCrossing.id;
      console.log(`Added legacy crossing ${newCrossing.legacyId} to DB`);
    } else {
      const updatedCrossing = await addCrossingToCommunity(lokka, newId, crossing.communityId);
      console.log(`Added legacy crossing ${updatedCrossing.legacyId} to community ${crossing.communityId}`);
    }
  }  
}

fs.readFile(
  'populateDB/data/legacyCrossings.csv', 'utf8',
  (err, data) => {
    csv.parse(data, {columns: true}, (err, data) => {
      processCrossings(data);
    });
  });
