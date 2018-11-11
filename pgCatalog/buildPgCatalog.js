require('promise.prototype.finally').shim();
// process.env.DEBUG="graphile-build:warn";
const {createPostGraphileSchema} = require("postgraphile");
const floodsPool = require('../db/helpers/getClient')({
  clientType: 'floodsAPI',
  pool: true
});

let errFlag;
createPostGraphileSchema(floodsPool, 'floods', {
  writeCache: `${__dirname}/postgraphile.cache`
})
.catch((err)=>{
  console.error(err);
  errFlag = true;
})
.finally(() => {
  if (floodsPool) return floodsPool.end()
})
.finally(() => {
  if (errFlag) process.exit(1);
  process.exit(0);
});
