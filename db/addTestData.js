const pg = require('./pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');
const defaultDb = require('./cons/default');
let defaultConn;

defaultDb.connect({direct: true})
.then((result) => {
  defaultConn = result;
  const addTestData = new QueryFile(path.join(__dirname, '/../populateDB/testing/addTestData.sql'), {minify: true});
  return floodsConn.query(addSetupData);
})
.finally(() => {
  if (defaultConn) defaultConn.close();
})
