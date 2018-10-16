require('promise.prototype.finally').shim();
const getPool = require('./getPool');
/**
  Wrapper function that builds and safely destroys a db connection for a node postgres script.
  @param: cb, Function - a node pg script that requires a db connection
  @param: poolType, String - param for getPool(), "floodsAdminPool", "masterAdminPool" or "floodsAPIPool"
**/
module.exports = (cb, poolType) => {
  let client, errFlag = false;
  return getPool(poolType).connect()
  .then((result) => {
    client = result;
    return cb(client)
  })
  .catch((err)=>{
    console.error(err);
    errFlag = true;
  })
  .finally(() => {
    if (client) client.release();
    console.log("Exiting Safely");
    if (errFlag) process.exit(1); //Must exit with error for propagate to TravisCI
    process.exit();
  })
}
