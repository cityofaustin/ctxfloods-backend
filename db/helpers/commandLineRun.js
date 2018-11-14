require('promise.prototype.finally').shim();
const getClient = require('./getClient');
/**
  Wrapper function that builds and safely destroys a db connection for a node postgres script.
  @param: cb, Function - a node pg script that requires a db connection
  @param: clientType, String - param for getClient(), "floodsAdminPool", "masterAdminPool" or "floodsAPIPool"
**/
module.exports = (cb, clientType) => {
  let client, errFlag = false;

  client = getClient({clientType});
  return client.connect()
  .then(() => cb(client))
  .catch((err)=>{
    console.error(err);
    errFlag = true;
  })
  .finally(() => {
    if (client) return client.end()
  })
  .finally(() => {
    console.log("Exiting Safely");
    if (errFlag) process.exit(1); //Must exit with error for propagate to TravisCI
    process.exit();
  })
}
