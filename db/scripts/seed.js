const fs = require('fs');
const path = require('path');
const commandLineRun = require("../helpers/commandLineRun")

const addApiUser = require('./addApiUser');
const addSuperAdminUser = require('./addSuperAdminUser');
const addWazeStreets = require('../../populateDB/data/addWazeStreets');
const addLegacyCrossings = require('../../populateDB/data/addLegacyCrossings');
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
  const addSetupData = fs.readFileSync(path.join(__dirname, '/../../populateDB/data/addSetupData.sql'), 'utf8');
  return client.query(addSetupData)
  .then(() => addApiUser(client))
  .then(() => addSuperAdminUser(client))
  .then(() => {
    console.log("Adding Communities");
    const addCommunities = fs.readFileSync(path.join(__dirname, '/../../populateDB/data/addCommunities.sql'), 'utf8');
    return client.query(addCommunities)
  })
  .then(async () => {
    console.log("Adding Waze Streets");
    await addWazeStreets(client);
  })
  .then(async () => {
    console.log('Adding Legacy Crossings');
    await addLegacyCrossings(client);
  })
  .then(() => {
    console.log('Adding Cameras');
    const addCameras = fs.readFileSync(path.join(__dirname, '/../../populateDB/data/addCameras.sql'), 'utf8');
    return client.query(addCameras)
  })
  .then(() => {
    console.log("Finished Seeding Data")
  })
};

module.exports = seed;

if (require.main === module) {
  commandLineRun(seed, "floodsAdmin");
}
