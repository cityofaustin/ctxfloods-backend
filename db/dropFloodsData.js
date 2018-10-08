const Promise = require('bluebird');
const pg = require('../db/pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');
const floodsDb = require('./cons/floods');
const defaultDb = require('./cons/default');
const floodsExists = require('./floodsExists');

let floodsConn, defaultConn, errFlag = false;

/**
  Drops all data in floods database.
  If "destory" flag is set to true, "floods" database will be destroyed after deleting data.
  During "destroy", any existing pg connections are terminated.

  @param destroy: Boolean, default=false - if triggered, will destroy floods database in addition to deleting its data
**/
const dropFloodsData = (destroy=false) => {
  defaultDb.connect({direct: true})
  .then((result) => {
    defaultConn = result;
    return floodsExists(defaultConn);
  })
  .then((result) => {
    if (!result) {
      console.log("Nothing to drop - floods already doesn't exist");
      defaultConn.done();
      process.exit(0);
    }
    return floodsDb.connect({direct: true})
  })
  .then((result) => {
    floodsConn = result;
    const dropScript1 = new QueryFile(path.join(__dirname, '/../populateDB/drop1.sql'), {minify: true});
    return floodsConn.query(dropScript1);
  })
  .then(() => {
    floodsConn.done();
    if (destroy) {
      const dropScript2 = new QueryFile(path.join(__dirname, '/../populateDB/drop2.sql'), {minify: true});
      return defaultConn.query(dropScript2)
      .then(() => {
        const dropScript3 = new QueryFile(path.join(__dirname, '/../populateDB/drop3.sql'), {minify: true});
        return defaultConn.query(dropScript3);
      })
    }
  })
  .catch((err)=>{
    console.log(err);
    errFlag = true;
  })
  .finally(() => {
    try {
      if (floodsConn && !floodsConn._ending && floodsConn._connected) floodsConn.done();
    } catch(err) {
      console.log("Problem disconnecting floodsConn", err)
      errFlag = true
    }
    try {
      if (defaultConn) defaultConn.done();
    } catch(err) {
      console.log("Problem disconnecting defaultConn", err)
      errFlag = true
    }
  })
  .then(() => {
    if (errFlag) process.exit(1);
    process.exit();
  })
}

module.exports = dropFloodsData;

if (require.main === module) {
  dropFloodsData()
}
