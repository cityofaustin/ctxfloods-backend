const axios = require('axios');
const parseString = require('xml2js').parseString;
const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

const {getToken} = require('./graphql');

const url = 'https://www.atxfloods.com/dashboard/phpsqlajax_genxml.php';
const statuses = {
  "on": 1,
  "off": 2,
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
  `, crossingToUpdate);

  return response.newStatusUpdate.statusUpdate;
}

async function getCrossings() {
  const anonLokka = new Lokka({ transport: new HttpTransport('http://localhost:5000/graphql') });

  const response = await anonLokka.send(
    `
    {
      allCrossings {
        nodes {
          id
          legacyId
          latestStatusId
        }
      }
    }
  `);

  return response.allCrossings.nodes;
}

function getCrossingsToUpdate(dbCrossings, legacyCrossings) {
  const crossingsToUpdate = [];

  for (legacyCrossing of legacyCrossings) {
    const match = dbCrossings.find(c => c.legacyId === legacyCrossing.id && c.latestStatusId !== legacyCrossing.status);
    if (match) {
      crossingsToUpdate.push({
        crossingId: match.id,
        statusId: legacyCrossing.status,
        statusReasonId: legacyCrossing.status === 2 ? 1 : null,
        notes: 'From ATXFloods.com'
      });
    }
  }

  return crossingsToUpdate;
}

async function processLegacyCrossings(legacyCrossings) {
  const dbCrossings = await getCrossings();
  const crossingsToUpdate = getCrossingsToUpdate(dbCrossings, legacyCrossings);

  // FIXME: Make a new user and put in ENV
  const token = await getToken('superadmin@flo.ods', 'texasfloods');
  const headers = {
    Authorization: 'Bearer ' + token,
  };
  const lokka = new Lokka({
    transport: new HttpTransport('http://localhost:5000/graphql', { headers }),
  });

  for(crossing of crossingsToUpdate) {
    const updated = await newStatusUpdate(crossing, lokka);
    console.log(updated);
  }
}

async function getLegacy(url) {
  try {
    const response = await axios.get(url);
    parseString(response.data, (err, result) => {
      const crossings = result.markers.marker.map(crossing => {return {id: parseInt(crossing.$.id), status: statuses[crossing.$.type]}});
      processLegacyCrossings(crossings);
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports.handle = (event, context, cb) => {
  getLegacy(url);
  cb(null, null);
}
