const axios = require('axios');
const parseString = require('xml2js').parseString;
const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

const url = 'https://www.atxfloods.com/dashboard/phpsqlajax_genxml.php';
const statuses = {
  "on": 1,
  "off": 2,
};

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
        statusReasonId: legacyCrossing.status === 2 && 1,
        notes: 'From ATXFloods.com'
      });
    }
  }

  return crossingsToUpdate;
}

async function processLegacyCrossings(legacyCrossings) {
  const dbCrossings = await getCrossings();
  const crossingsToUpdate = getCrossingsToUpdate(dbCrossings, legacyCrossings);
  console.log(crossingsToUpdate);
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

getLegacy(url);
