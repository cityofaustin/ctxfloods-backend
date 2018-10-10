const fs = require('fs');
const path = require('path');
const commandLineRun = require("./helpers/commandLineRun")

const addWazeStreets = require('../populateDB/data/addWazeStreets');
const addLegacyCrossings = require('../populateDB/data/addLegacyCrossings');
let localServer;
/**
  Seeds a database with
  1) Setup data
  2) Communities
  3) Waze streets
  4) Legacy Crossings

  Migrate must be run before seeding.
  @param client Client - a connection to a database
**/
const seed = (client) => {
  console.log("Adding Setup Data");
  const addSetupData = fs.readFileSync(path.join(__dirname, '/../populateDB/data/addSetupData.sql'), 'utf8');
  return client.query(addSetupData)
  .then(() => {
    console.log("Adding Communities");
    const addCommunities = fs.readFileSync(path.join(__dirname, '/../populateDB/data/addCommunities.sql'), 'utf8');
    return client.query(addCommunities)
  })
  .then(async () => {
    if (process.env.PGENDPOINT === "localhost") {
      localServer = require('../localServer');
    }
    console.log("Adding Waze Streets");
    await addWazeStreets();
    console.log("Skipping??")
  })
  .then(async () => {
    await addLegacyCrossings()
  })
  .then(() => {
    console.log("Finished Seeding Data")
  })
  .finally(() => {
    if (localServer) localServer.close(()=>{
      console.log("Local server closed");
    });
  })
};

module.exports = seed;

if (require.main === module) {
  commandLineRun(seed, "floodsAPI");
}
