const axios = require('axios');
const parseString = require('xml2js').parseString;
const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

const { getAuthorizedLokka } = require('./graphql');
const { logError } = require('./logger');

const beholderUrl = 'https://map.beholderhq.com/api/v1/beholderhq/cameras/';
const beholderPhotoUrl = 'https://assets.beholderhq.com/v3/photos/';

async function newStatusUpdate(update, lokka) {
  const response = await lokka.send(
    `
    mutation ($crossingId:Int!, $statusId:Int!, $statusReasonId:Int, $notes:String!, $image:String!) {
      newStatusUpdate(input:{crossingId:$crossingId, statusId:$statusId, statusReasonId:$statusReasonId, notes:$notes, image:$image}) {
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

async function getLatestPicture(cameraId) {
  const cameraUrl = `${beholderUrl}${cameraId}`;
  const response = await axios.get(cameraUrl);
  const latestId = response.data.data.attributes['latest-photo-id'];
  const photoUrl = `${beholderPhotoUrl}${latestId}-original.jpg`;
  debugger;
  const photoResponse = await axios.get(photoUrl, {
    responseType: 'arraybuffer',
  });
  const image = Buffer.from(photoResponse.data, 'binary').toString('base64');
  return image;
}

async function getCrossingsWithCameras(dbCrossings) {
  const updates = [];

  const matches = dbCrossings.filter(
    c => c.cameraId !== null && c.cameraType === 'Beholder',
  );

  for (crossing of matches) {
    const latestImage = await getLatestPicture(crossing.cameraId);

    // const imageInNotes = `<img src="data:image/png;base64, ${latestImage}" />`;

    updates.push({
      crossingId: crossing.id,
      statusId: 1,
      statusReasonId: null,
      notes: 'FOUND A CAMERA',
      image: latestImage,
    });
  }

  return updates;
}

async function scrapeCameras(cb) {
  try {
    const dbCrossings = await getCrossings();

    const updates = await getCrossingsWithCameras(dbCrossings);

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
