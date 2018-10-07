const pg = require('./pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');

const initialize = (conn) => {
  console.log("initializing")
  const createScript = new QueryFile(path.join(__dirname, '/createFloods.sql'), {minify: true});
  return conn.query(createScript)
}

module.exports = initialize;
