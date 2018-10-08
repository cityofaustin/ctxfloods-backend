const Promise = require('bluebird');
const pg = require('./pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');

const floodsExists = require('./floodsExists');
const initialize = require('./initialize');
const migrate = require('./migrate');
const addWazeStreets = require('../populateDB/data/addWazeStreets');
const addLegacyCrossings = require('../populateDB/data/addLegacyCrossings')

const defaultDb = require('./cons/default');
let localServer, defaultConn, floodsConn, errFlag = false, newInstance = false;

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
      console.log("Adding Setup Data");
      const addSetupData = new QueryFile(path.join(__dirname, '/../populateDB/data/addSetupData.sql'), {minify: true});
      return floodsConn.query(addSetupData)
    })
    .then(() => {
      console.log("Adding Communities");
      const addCommunities = new QueryFile(path.join(__dirname, '/../populateDB/data/addCommunities.sql'), {minify: true});
      return floodsConn.query(addCommunities)
    })
    .then(() => {
      localServer = require('../localServer');
      console.log("Adding Waze Streets");
      return Promise.method(addWazeStreets)()
      // .tap(()=> {
      //   console.log("TAPPED WazeStreets")
      // })
    })
    .then(() => {
      return Promise.method(addLegacyCrossings)()
      // .tap(()=> {
      //   console.log("TAPPED legacy")
      // })
      // .then(()=>{
      //   console.log("THENED")
      // })
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
