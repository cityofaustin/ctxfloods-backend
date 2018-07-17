const fs = require('fs');
const csv = require('csv');

const { getAuthorizedLokka } = require('../../handlers/graphql');

async function addCrossing(lokka, crossing) {
  const response = await lokka.send(
    `
    mutation($name:String!, $communityId:Int!, $legacyId:Int, $humanAddress:String!, $latitude:Float!, $longitude:Float!, $description:String, $wazeStreetId:Int) {
      newCrossing(input: {name:$name, communityId:$communityId, legacyId:$legacyId, humanAddress:$humanAddress, longitude:$longitude, latitude:$latitude, description:$description, wazeStreetId: $wazeStreetId}) {
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
      description: crossing.description || '',
      wazeStreetId: crossing.wazeStreetId || null,
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
  try {
    const lokka = await getAuthorizedLokka('superadmin@flo.ods', 'texasfloods');

    let legacyToNewMap = {};
    for (crossing of crossings) {
      const newId = legacyToNewMap[crossing.legacyId];

      if (!newId) {
        const newCrossing = await addCrossing(lokka, crossing);
        legacyToNewMap[newCrossing.legacyId] = newCrossing.id;
        console.log(`Added legacy crossing ${newCrossing.legacyId} to DB`);
      } else {
        const updatedCrossing = await addCrossingToCommunity(
          lokka,
          newId,
          crossing.communityId,
        );
        console.log(
          `Added legacy crossing ${updatedCrossing.legacyId} to community ${
            crossing.communityId
          }`,
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}

fs.readFile('populateDB/data/legacyCrossings.csv', 'utf8', (err, data) => {
  csv.parse(data, { columns: true }, (err, data) => {
    processCrossings(data);
  });
});
