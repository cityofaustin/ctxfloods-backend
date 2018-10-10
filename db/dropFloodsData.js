require('promise.prototype.finally').shim();
const fs = require('fs');
const path = require('path');

const getClient = require('./cons/getClient');
const floodsExists = require('./floodsExists');

let floodsClient, masterClient, errFlag = false;

/**
  Drops all data in floods database.
  If "destory" flag is set to true, "floods" database will be destroyed after deleting data.
  During "destroy", any existing pg connections are terminated.

  @param destroy: Boolean, default=false - if triggered, will destroy floods database in addition to deleting its data
**/
const dropFloodsData = (destroy=false) => {
  console.log("Begin Dropping Floods Data");
  getClient("master")
  .then((result) => {
    masterClient = result;
    return floodsExists(masterClient);
  })
  .then((result) => {
    if (!result) {
      console.log("Nothing to drop - floods already doesn't exist");
      return masterClient.end()
      .then(()=>{
        process.exit(0);
      })
    }
    return getClient("floodsAPI")
  })
  .then((result) => {
    floodsClient = result;
    const dropScript1 = fs.readFileSync(path.join(__dirname, '/../populateDB/drop1.sql'), 'utf8');
    return floodsClient.query(dropScript1);
  })
  .then(() => floodsClient.end())
  .then(() => {
    if (destroy) {
      const dropScript2 = fs.readFileSync(path.join(__dirname, '/../populateDB/drop2.sql'), 'utf8');
      return masterClient.query(dropScript2)
      .then(() => {
        const dropScript3 = fs.readFileSync(path.join(__dirname, '/../populateDB/drop3.sql'), 'utf8');
        return masterClient.query(dropScript3);
      })
    }
  })
  .then(()=>{
    console.log("Finish Dropping Floods Data");
  })
  .catch((err)=>{
    console.log(err);
    errFlag = true;
  })
  .finally(() => {
    try {
      if (floodsClient && !floodsClient._ending && floodsClient._connected) floodsClient.end();
    } catch(err) {
      console.log("Problem disconnecting floodsClient", err);
      errFlag = true;
    }
    try {
      if (masterClient) masterClient.end();
    } catch(err) {
      console.log("Problem disconnecting masterClient", err);
      errFlag = true;
    }
  })
  .finally(() => {
    if (errFlag) process.exit(1);
    process.exit();
  })
}

module.exports = dropFloodsData;

if (require.main === module) {
  dropFloodsData()
}
