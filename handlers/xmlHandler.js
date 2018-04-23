const Client = require('pg').Client;
const Raven = require('raven');
const RavenLambdaWrapper = require('serverless-sentry-lib');

module.exports.handle = RavenLambdaWrapper.handler(
  Raven,
  (event, context, cb) => {
    const pgClient = new Client(process.env.PGCON);
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
      .catch(err => cb(null, { errors: [err] }))
      .then(() => pgClient.end());
  },
);
