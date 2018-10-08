const pg = require('./pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');
const commandLineRun = require('./helpers/commandLineRun');

const addTestData = (conn) => {
  const addTestData = new QueryFile(path.join(__dirname, '/../populateDB/testing/addTestData.sql'), {minify: true});
  return conn.query(addTestData);
}

module.exports = addTestData;

if (require.main === module) {
  const floodsDb = require('./cons/floods');
  commandLineRun(addTestData, floodsDb);
}
