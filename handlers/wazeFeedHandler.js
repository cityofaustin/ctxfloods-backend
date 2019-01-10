require('promise.prototype.finally').shim();
const { logError } = require('./logger');
const getClient = require('../db/helpers/getClient');

function getPgResAsIncidentJson(rows) {
  return {
    incidents: rows.map((row) => ({
      id: row.id,
      location: {
        street: row.street,
        polyline: row.polyline,
        direction: row.direction,
      },
      type: row.type,
      subtype: row.subtype,
      starttime: row.starttime,
      description: row.description,
      reference: row.reference,
    })),
  };
}
module.exports.getPgResAsIncidentJson = getPgResAsIncidentJson;

module.exports.handle = (event, context, cb) => {
  const pgClient = getClient({clientType: "floodsAPI"});
  pgClient.connect();

  pgClient
    .query('select * from floods.waze_feed()')
    .then(pgres => {
      const incidentJson = getPgResAsIncidentJson(pgres.rows);

      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: incidentJson,
      };

      cb(null, response);
    })
    .catch(err => {
      logError(err);
      // TODO: Actually send back a response error
      return cb(null, { errors: [err] });
    })
    .finally(() => pgClient.end());
};
