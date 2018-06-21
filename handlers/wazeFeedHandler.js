const Client = require('pg').Client;

function getPgResAsIncidentJson(rows) {
  return rows;
  return {
    incidents: rows.map(({waze_feed: row}) => ({
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
  const pgClient = new Client(process.env.PGCON);
  pgClient.connect();

  pgClient
    .query('select floods.waze_feed()')
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
      console.error(err);
      return cb(null, { errors: [err] });
    })
    .then(() => pgClient.end());
};
