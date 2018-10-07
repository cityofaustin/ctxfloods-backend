const pg = require('./pg');

/**
  Creates connection to pg database with given params.

  @param: opts.host
  @param: opts.database
  @param: opts.user
  @param: opts.password
  @returns: db, Database Class - a Database Class instance that can create a connection
    Connect with a pool: db.connect()
    Connect with a single client: db.connect({direct: true})
**/
const createCon = (opts) => {
  const {host, database, user, password} = opts;
  const config = `postgresql://${user}${password ? `:${password}` : ''}@${process.env.PGENDPOINT}:5432/${database}`;
  const db = pg(config);
  return db
}

module.exports = createCon;
