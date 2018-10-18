const {Pool} = require('pg');
const _ = require('lodash');

const cachedPools = {
  floodsAdmin: null,
  floodsAPI: null,
  masterAdmin: null
}

/**
  This logic closes all pools safely at the end of an entire process.
  This is useful for initialization scripts, local testing, and handling emergencies gracefully.

  This logic will not release Clients taken from the connection Pool.
  If you were to create a handler that manually took a Client from a Pool, you would have to remember to release that client.
  Individual Clients taken from connection Pools must be released every time! Even on errors.
  However, when you plug a Pool instance into postgraphile, postgraphile takes care of client releasing automatically.
**/
const closeAllPools = (messageTemplate) => {
  _.each(cachedPools, (pool, poolName) => {
    if (pool) {
      console.log(messageTemplate({poolName}));
      pool.end();
    }
  })
  console.log("All pools safely closed");
}
process.on('SIGTERM', () => closeAllPools(_.template("Signal Terminated - closing <%= poolName %>")));
process.on('SIGINT', () => closeAllPools(_.template("Signal Interrupted - closing <%= poolName %>")));
process.on('exit', () => closeAllPools(_.template("Process Exiting - closing <%= poolName %>")));

/**
  Creates or retrieves a postgres connection Pool.
  Pools are cached once initialized so that multiple pools are not created.

  @param poolType, String - flag to identify which postgres Pool you want to get
    floodsAdmin - for initialization scripts. Logs into "floods" db with master credentials
    floodsAPI - for normal API/Graphql operations. Logs into "floods" db with api credentials.
    masterAdmin - only for database destroy script. Logs into default "postgres" db with master credentials.
  @returns: pool, a postgres Pool Instance
**/
const getPool = (poolType) => {
  const cachedPool = cachedPools[poolType];
  if (cachedPool) return cachedPool;

  let user, password, database;
  if (poolType === "floodsAdmin") {
    user = process.env.PGUSERNAME;
    password = process.env.PGPASSWORD;
    database = "floods";
  } else if (poolType === "floodsAPI") {
    user = "floods_postgraphql";
    password = "xyz";
    database = "floods";
  } else if (poolType === "masterAdmin") {
    user = process.env.PGUSERNAME;
    password = process.env.PGPASSWORD;
    database = "postgres";
  } else {
    throw new error(`Please enter a valid poolType; ex. "floodsAPI"`)
  }

  const pool = new Pool({
    host: process.env.PGENDPOINT,
    port: 5432,
    user: user,
    password: password,
    database: database
  });

  pool.on('error', (err)=>{
    console.error("Pool Error", err);
  })

  cachedPools[poolType] = pool;

  return pool
}

module.exports = getPool;
