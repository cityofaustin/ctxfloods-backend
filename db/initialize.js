const fs = require('fs');
const path = require('path');

const floodsExists = require('./floodsExists');
const commandLineRun = require('./helpers/commandLineRun');

const initialize = (client) => {
  console.log("Creating Floods Database")
  return floodsExists(client)
  .then((result) => {
    if (result) {
      console.log("Floods Database already exists");
    } else {
      const createScript = fs.readFileSync(path.join(__dirname, '/createFloods.sql'), 'utf8');
      return client.query(createScript)
    }
  })
}

module.exports = initialize;

if (require.main === module) {
  commandLineRun(initialize, "master");
}
