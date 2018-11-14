require('promise.prototype.finally').shim();
const path = require('path');

const getClient = require('../helpers/getClient');
const floodsExists = require('./floodsExists');
const initialize = require('./initialize');
const migrate = require('./migrate');
const seed = require('./seed');

let localServer, masterClient, floodsClient, errFlag = false, newInstance = false;

/**
  Complete database initialization script.
  1) initialize: Creates 'floods' database if it doesn't exist
  2) migrate: Performs migrations
  3) seed: Will only seed data if this is a new database

  Idempotent - can be run multiple times without contaminating data.
  Seed script only runs at first db initialization.
**/
masterClient = getClient({clientType: "masterAdmin"});
masterClient.connect()
.then(() => floodsExists(masterClient))
.then((result) => {
  if (!result) {
    newInstance = true;
    return initialize(masterClient);
  }
})
.then(() => migrate())
.then(() => {
  if (newInstance) {
    console.log("Seeding data for new floods database");
    floodsClient = getClient({clientType: "floodsAdmin"});
    return floodsClient.connect()
    .then(() => seed(floodsClient))
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
  if (floodsClient) return client.end()
})
.finally(() => {
  if (masterClient) return client.end()
})
.finally(() => {
  console.log("Exiting Safely");
  if (errFlag) process.exit(1); //Must exit with error to propagate to TravisCI
  process.exit();
})
