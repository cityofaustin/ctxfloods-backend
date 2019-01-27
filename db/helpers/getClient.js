const pg = require('pg');
const {Pool, Client} = pg;
const _ = require('lodash');
const logError = require('../../handlers/logger');

/**
  Creates and returns a pg client.
  Using individual clients rather than a pool works best for lambda functions.
  However, postgraphile requires a pool instance, so we have an option for returning a pool.
  Remember to .end() your clients!

  @param clientType, String - identify which postgres client you want to get
    floodsAdmin - for initialization scripts. Logs into "floods" db with master credentials
    floodsAPI - for normal API/Graphql operations. Logs into "floods" db with api credentials.
    masterAdmin - only for database destroy script. Logs into default "postgres" db with master credentials.
  @param pool, Boolean - flag to identify if you want to return a pg pool instance rather than a single client.

  @returns: a postgres client or pool
**/
const getClient = ({clientType, pool}) => {

  let user, password, database;
  if (clientType === "floodsAdmin") {
    user = process.env.PG_MASTER_USR;
    password = process.env.PG_MASTER_PW;
    database = "floods";
  } else if (clientType === "floodsAPI") {
    user = process.env.PG_API_USR;
    password = process.env.PG_API_PW;
    database = "floods";
  } else if (clientType === "masterAdmin") {
    user = process.env.PG_MASTER_USR;
    password = process.env.PG_MASTER_PW;
    database = process.env.PG_MASTER_DB_NAME;
  } else {
    throw new error(`Please enter a valid client type; ex. "floodsAPI"`)
  }

  const options = {
    host: process.env.PG_ENDPOINT,
    port: process.env.PG_PORT,
    user: user,
    password: password,
    database: database
  };

  let client;

  if (pool) {
    // For closing connection pools in lambda
    // source: https://github.com/graphile/postgraphile/issues/724
    // options.idleTimeoutMillis = 0.001;
    client = new Pool(options);
  } else {
    client = new Client(options);
  }

  client.on('error', (err)=>{
    logError("Pool Error", err);
    return client.end();
  })

  return client
}

module.exports = getClient;
