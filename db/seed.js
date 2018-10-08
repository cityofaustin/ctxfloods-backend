const Promise = require('bluebird');
const pg = require('./pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');
const commandLineRun = require("./helpers/commandLineRun")

const addWazeStreets = require('../populateDB/data/addWazeStreets');
const addLegacyCrossings = require('../populateDB/data/addLegacyCrossings');

/**
  Seeds a database with
  1) Setup data
  2) Communities
  3) Waze streets
  4) Legacy Crossings

  Migrate must be run before seeding.
  @param conn Client - a connection to a database
**/
const seed = (conn) => {
  console.log("Adding Setup Data");
  const addSetupData = new QueryFile(path.join(__dirname, '/../populateDB/data/addSetupData.sql'), {minify: true});
  return conn.query(addSetupData)
  .then(() => {
    console.log("Adding Communities");
    const addCommunities = new QueryFile(path.join(__dirname, '/../populateDB/data/addCommunities.sql'), {minify: true});
    return conn.query(addCommunities)
  })
  .then(() => {
    localServer = require('../localServer');
    console.log("Adding Waze Streets");
    return Promise.method(addWazeStreets)()
  })
  .then(() => {
    return Promise.method(addLegacyCrossings)()
  })
  .then(() => {
    console.log("Finished Seeding Data")
  })
};

module.exports = seed;

if (require.main === module) {
  const floodsDb = require('./cons/floods');
  commandLineRun(seed, floodsDb);
}
