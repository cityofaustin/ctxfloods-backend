const fs = require('fs');
const path = require('path');
const commandLineRun = require('../helpers/commandLineRun');

const addTestData = (client) => {
  const addTestData = fs.readFileSync(path.join(__dirname, '/../../populateDB/testing/addTestData.sql'), 'utf8');
  return client.query(addTestData);
}

module.exports = addTestData;

if (require.main === module) {
  commandLineRun(addTestData, "floodsAdmin");
}
