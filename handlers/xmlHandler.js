const Client = require('pg').Client;
const { logError } = require('./logger');

module.exports.handle = (event, context, cb) => {
  const pgClient = new Client(require('../tools/getPgCon')());
  pgClient.connect();

  pgClient
    .query('select floods.legacy_xml()')
    .then(pgres => {
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
        body: pgres.rows[0].legacy_xml,
      };

      cb(null, response);
    })
    .catch(err => {
      logError(err);
      return cb(null, { errors: [err] });
    })
    .then(() => pgClient.end());
};
