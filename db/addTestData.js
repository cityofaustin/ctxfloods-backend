const pg = require('./pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');

const addTestData = new QueryFile(path.join(__dirname, '/../populateDB/testing/addTestData.sql'), {minify: true});
return floodsConn.query(addSetupData)
