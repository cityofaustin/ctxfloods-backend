const Promise = require('bluebird');
const pg = require('./pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');

const floodsExists = require('./floodsExists');
const initialize = require('./initialize');
const migrate = require('./migrate');
const seed = require('./seed');

const defaultDb = require('./cons/default');
let localServer, defaultConn, floodsConn, errFlag = false, newInstance = false;

/**
  Complete database initialization script.
  1) initialize: Creates 'floods' database if it doesn't exist
  2) migrate: Performs migrations
  3) seed: Will only seed data if this is a new database

  Idempotent - can be run multiple times without contaminating data.
  Seed script only runs at first db initialization.
**/
return defaultDb.connect({direct: true})
.then((result) => {
  defaultConn = result;
  return floodsExists(defaultConn);
})
.then((result) => {
  if (!result) {
    newInstance = true;
    return initialize(defaultConn);
  }
})
.then(() => migrate())
.then(() => {
  if (newInstance) {
    console.log("Seeding data for new floods database");
    const floodsDb = require('./cons/floods');
    return floodsDb.connect({direct: true})
    .then((result) => {
      floodsConn = result;
      return seed(floodsConn)
    })
  }
})
.then(() => {
  console.log("Finished!");
})
.catch((err)=>{
  console.error(err);
  errFlag = true;
})
.finally(() => {
  if (defaultConn) defaultConn.done();
  if (floodsConn) floodsConn.done();
  // if (localServer) localServer.close();
  if (errFlag) process.exit(1); //Must exit with error to propagate to TravisCI
  console.log("Exiting");
  process.exit();
})
