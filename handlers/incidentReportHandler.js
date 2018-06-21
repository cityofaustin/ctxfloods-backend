const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

const {getToken} = require('./graphql');

async function newIncidentReport(incidentReport, lokka) {
  const response = await lokka.send(
    `
    mutation (
      $notes: String,
      $locationDescription: String,
      $longitude: Float,
      $latitude: Float,
      $communityIds: [Int],
    ) {
      newIncidentReport(input:{
        notes: $notes,
        locationDescription: $locationDescription,
        longitude: $longitude,
        latitude: $latitude,
        communityIds: $communityIds,
      }) {
        incidentReport {
          id
        }
      }
    }
  `, incidentReport);

  return response.incidentReport;
}

module.exports.handle = async (event, context, cb) => {
  const incidentReport = JSON.parse(event.body);

  // FIXME: Make a new user and put in ENV
  const token = await getToken('superadmin@flo.ods', 'texasfloods');
  const headers = {
    Authorization: 'Bearer ' + token,
  };
  const lokka = new Lokka({
    transport: new HttpTransport('http://localhost:5000/graphql', { headers }),
  });

  await newIncidentReport(incidentReport, lokka);
};
