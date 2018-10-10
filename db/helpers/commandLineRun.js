require('promise.prototype.finally').shim();
const getClient = require('../cons/getClient');
/**
  Wrapper function that builds and safely destroys a db connection for a node postgres script.
  @param: cb, Function - a node pg script that requires a db connection
  @param: clientType, String - param for getClient, either "floodsAPI" or "master"
**/
module.exports = (cb, clientType) => {
  let client, errFlag = false;
  return getClient(clientType)
  .then((result) => {
    client = result;
    return cb(client)
  })
  .catch((err)=>{
    console.error(err);
    errFlag = true;
  })
  .finally(() => {
    if (client) client.end();
    console.log("Exiting Safely");
    if (errFlag) process.exit(1); //Must exit with error for propagate to TravisCI
    process.exit();
  })
}
