const Promise = require('bluebird');
const pg = require('pg-promise');

Promise.promisifyAll(pg, { multiArgs: true });

/**
  Programatically build connection string.
  "database" and "password" are optional for the sake of some scripts - can use empty strings for them.
**/
const createCon = (host, database, user, password) => {
  const config = `postgresql://${user}${password ? `:${password}` : ''}@${process.env.PGENDPOINT}:5432/${database}`;
  const db = new pg.Client(config);
  return db
}

module.exports = createCon;
