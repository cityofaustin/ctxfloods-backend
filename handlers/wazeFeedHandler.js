const Client = require('pg').Client;

module.exports.handle = (event, context, cb) => {
  const pgClient = new Client(process.env.PGCON);
  pgClient.connect();

  pgClient
    .query('select floods.waze_feed()')
    .then(pgres => {
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: pgres.rows,
      };

      cb(null, response);
    })
    .catch(err => {
      console.error(err);
      return cb(null, { errors: [err] });
    })
    .then(() => pgClient.end());
};
