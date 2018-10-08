const pg = require('./pg.js');
const QueryFile = pg.QueryFile;
const path = require('path');
const floodsExists = require('./floodsExists');
const commandLineRun = require('./helpers/commandLineRun');

const initialize = (conn) => {
  console.log("Creating Floods Database")
  const createScript = new QueryFile(path.join(__dirname, '/createFloods.sql'), {minify: true});
  return floodsExists(conn)
  .then((result) => {
    if (result) {
      console.log("Floods Database already exists");
    } else {
      return conn.query(createScript)
    }
  })
}

module.exports = initialize;

if (require.main === module) {
  const defaultDb = require('./cons/default');
  commandLineRun(initialize, defaultDb);
}
