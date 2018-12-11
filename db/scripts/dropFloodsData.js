require('promise.prototype.finally').shim();
const fs = require('fs');
const path = require('path');

const getClient = require('../helpers/getClient');
const floodsExists = require('./floodsExists');

/**
  Drops all data in floods database.
  If "destory" flag is set to true, "floods" database will be destroyed after deleting data.
  During "destroy", any existing pg connections are terminated.

  @param destroy: Boolean, default=false - if triggered, will destroy floods database in addition to deleting its data
**/
const dropFloodsData = (destroy=false) => {
  let floodsClient, masterClient, errFlag = false;
  console.log("Begin Dropping Floods Data");

  masterClient = getClient({clientType: "masterAdmin"});
  return masterClient.connect()
  .then(() => floodsExists(masterClient))
  .then((result) => {
    if (!result) {
      console.log("Nothing to drop - floods already doesn't exist");
      return masterClient.end()
      .finally(() => process.exit());
    }
    floodsClient = getClient({clientType: "floodsAdmin"})
    return floodsClient.connect()
  })
  .then(() => {
    const dropScript1 = fs.readFileSync(path.join(__dirname, '/../sql/drop1.sql'), 'utf8');
    return floodsClient.query(dropScript1);
  })
  .then(() => floodsClient.end())
  .then(() => {
    if (destroy) {
      const dropScript2 = fs.readFileSync(path.join(__dirname, '/../sql/drop2.sql'), 'utf8');
      return masterClient.query(dropScript2)
      .then(() => {
        const dropScript3 = fs.readFileSync(path.join(__dirname, '/../sql/drop3.sql'), 'utf8');
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
    if (floodsClient) return client.end()
  })
  .finally(() => {
    if (masterClient) return client.end()
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
