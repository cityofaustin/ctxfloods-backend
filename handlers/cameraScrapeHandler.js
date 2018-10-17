const axios = require('axios');
const parseString = require('xml2js').parseString;
const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

const { getAuthorizedLokka } = require('./graphql');
const { logError } = require('./logger');

async function newStatusUpdate(update, lokka) {
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
    update,
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
          cameraId
          cameraType
        }
      }
    }
  `,
  );

  return response.allCrossings.nodes;
}

function getCrossingsWithCameras(dbCrossings) {
  const updates = [];

  const matches = dbCrossings.filter(
    c => c.cameraId !== null && c.cameraType === 'Beholder',
  );

  for (crossing of matches) {
    updates.push({
      crossingId: crossing.id,
      statusId: 1,
      statusReasonId: null,
      notes: 'FOUND A CAMERA',
    });
  }

  return updates;
}

async function scrapeCameras(cb) {
  try {
    debugger;
    const dbCrossings = await getCrossings();

    const updates = getCrossingsWithCameras(dbCrossings);

    // FIXME: Make a new user and put in ENV
    const lokka = await getAuthorizedLokka('superadmin@flo.ods', 'texasfloods');

    for (update of updates) {
      const updated = await newStatusUpdate(update, lokka);
      console.log(updated);
    }
  } catch (err) {
    logError(err);
    cb(null, { statusCode: 500, errors: [err] });
  }
}

module.exports.handle = (event, context, cb) => {
  scrapeCameras(cb);
};
