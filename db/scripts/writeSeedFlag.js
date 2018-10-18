const fs = require('fs');

const getPool = require('../helpers/getPool');
const floodsExists = require('./floodsExists');
const commandLineRun = require('../helpers/commandLineRun');

let masterClient;

/**
  Write a SEED_FLAG to a file.
  This allows you to propagate that environment variable to the surrounding bash script scope.
  Seeding will take place in a further step in the deploy.sh script.
**/
const writeSeedFlag = (client) => {
  return floodsExists(client)
  .then((result) => {
    const shouldSeed = result ? "false" : "true";
    fs.writeFileSync(`${__dirname}/../../deployment/seed_flag.tmp`, `export SEED_FLAG=${shouldSeed}`);
  })
}

module.exports = writeSeedFlag

if (require.main === module) {
  commandLineRun(writeSeedFlag, "masterAdmin");
}
