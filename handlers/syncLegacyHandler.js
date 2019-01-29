const axios = require('axios');
const parseString = require('xml2js').parseString;
const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

const { getAuthorizedLokka } = require('../helpers/graphql');
const { logError } = require('../helpers/logger');

const url = 'https://www.atxfloods.com/dashboard/phpsqlajax_genxml.php';
const statuses = {
  on: 1,
  off: 2,
};

async function newStatusUpdate(crossingToUpdate, lokka) {
  const response = await lokka.send(
    `
    mutation ($crossingId:Int!, $statusId:Int!, $statusReasonId:Int, $notes:String!) {
      newStatusUpdate(input:{crossingId:$crossingId, statusId:$statusId, statusReasonId:$statusReasonId, notes:$notes}) {
        statusUpdate {
          crossingId
          statusId
        }
      }
    }
  `,
    crossingToUpdate,
  );

  return response.newStatusUpdate.statusUpdate;
}

async function getCrossings() {
  const anonLokka = new Lokka({
    transport: new HttpTransport(process.env.GRAPHQL_ENDPOINT),
  });

  const response = await anonLokka.send(
    `
    {
      allCrossings {
        nodes {
          id
          geojson
          latestStatusId
        }
      }
    }
  `,
  );

  return response.allCrossings.nodes;
}

function getCrossingsToUpdate(dbCrossings, legacyCrossings) {
  const crossingsToUpdate = [];

  for (legacyCrossing of legacyCrossings) {
    const match = dbCrossings.find(c => {
      const coordinates = JSON.parse(c.geojson).coordinates;
      return (
        coordinates[1] == legacyCrossing.lat &&
        coordinates[0] == legacyCrossing.lng &&
        c.latestStatusId !== legacyCrossing.status
      )
    });
    if (match) {
      crossingsToUpdate.push({
        crossingId: match.id,
        statusId: legacyCrossing.status,
        statusReasonId: legacyCrossing.status === 2 ? 1 : null,
        notes: 'From ATXFloods.com',
      });
    }
  }

  return crossingsToUpdate;
}

async function processLegacyCrossings(legacyCrossings) {
  const dbCrossings = await getCrossings();
  const crossingsToUpdate = getCrossingsToUpdate(dbCrossings, legacyCrossings);
  const lokka = await getAuthorizedLokka(process.env.GRAPHQL_API_USR, process.env.GRAPHQL_API_PW);

  for (crossing of crossingsToUpdate) {
    const updated = await newStatusUpdate(crossing, lokka);
    console.log(updated);
  }
}

async function getLegacy(url, cb) {
  try {
    const response = await axios.get(url);
    parseString(response.data, async (err, result) => {
      const crossings = result.markers.marker.map(crossing => {
        return {
          lat: crossing.$.lat,
          lng: crossing.$.lng,
          status: statuses[crossing.$.type],
        };
      });
      await processLegacyCrossings(crossings);
      cb(null, {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    });
  } catch (err) {
    logError(err);
    cb(null, {statusCode: 500, errors: [err]});
  }
}

module.exports.handle = (event, context, cb) => {
  getLegacy(url, cb);
};
