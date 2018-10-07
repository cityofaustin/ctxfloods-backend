const Promise = require('bluebird');
const pg = require('pg-promise')({
  promiseLib: Promise
});

const createCon = (host, database, user, password) => {
  const config = `postgresql://${user}${password ? `:${password}` : ''}@${process.env.PGENDPOINT}:5432/${database}`;
  const db = pg(config);
  return db
}

module.exports = createCon;
