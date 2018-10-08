const fs = require('fs');
const csv = require('csv');
const util = require('util');
const dsv = require('d3-dsv');
const readFile = util.promisify(fs.readFile);

const { getAuthorizedLokka } = require('../../handlers/graphql');

const LegacyCrossingsCsvPath = `${__dirname}/legacyCrossings.csv`;

async function loadCsv(path) {
  const str = await readFile(path, 'utf-8');
  return dsv.csvParse(str)
}

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

async function getExistingCrossings(lokka) {
  const response = await lokka.send(
    `
    {
      allCrossings {
        nodes {
          id
        }
      }
    }
  `,
  );

  return response.allCrossings.nodes;
}

async function removeCrossing(lokka, crossingId) {
  const response = await lokka.send(
    `
    mutation($crossingId:Int!) {
      removeCrossing(input:{crossingId:$crossingId}) {
        crossing {
          id
        }
      }
    }
  `,
    {
      crossingId: crossingId,
    },
  );

  return response.removeCrossing.crossing.id;
}

async function processCrossings() {

  const lokka = await getAuthorizedLokka('superadmin@flo.ods', 'texasfloods');

  let crossings = await loadCsv(LegacyCrossingsCsvPath);

  console.log('Removing Existing Crossings');
  const existingCrossings = await getExistingCrossings(lokka);

  for (crossing of existingCrossings) {
    const removedCrossingId = await removeCrossing(lokka, crossing.id);
    // console.log(`Removed existing crossing with id: ${removedCrossingId}`);
  }

  console.log('Adding Legacy Crossings');
  let legacyToNewMap = {};
  for (crossing of crossings) {
    const newId = legacyToNewMap[crossing.legacyId];

    if (!newId) {
      const newCrossing = await addCrossing(lokka, crossing);
      legacyToNewMap[newCrossing.legacyId] = newCrossing.id;
      // console.log(`Added legacy crossing ${newCrossing.legacyId} to DB`);
    } else {
      const updatedCrossing = await addCrossingToCommunity(
        lokka,
        newId,
        crossing.communityId,
      );
      // console.log(
      //   `Added legacy crossing ${updatedCrossing.legacyId} to community ${
      //     crossing.communityId
      //   }`,
      // );
    }
  }
}

async function addLegacyCrossings() {
  // const localServer = require('../../localServer');
  await fs.readFile('populateDB/data/legacyCrossings.csv', 'utf8', async (err, data) => {
    await csv.parse(data, { columns: true }, async (err, data) => {
      await processCrossings(data);
    });
  });
}

module.exports = processCrossings;

if (require.main === module) {
  process.env.JWT_SECRET="insecure";
  localServer = require('../../localServer');
  processCrossings();
}
