const fs = require('fs');

const getPool = require('../db/helpers/getPool');
const floodsExists = require('../db/scripts/floodsExists');
const commandLineRun = require('../db/helpers/commandLineRun');
const devDeployConfig = require('./devDeployConfig.js');''
const getBranch = require('./getBranch.js');

let masterClient;

/**
  Write a SEED_FLAG to a file.
  This allows you to propagate that environment variable to the surrounding bash script scope.
  Seeding will take place in a further step in the deploy.sh script.

  Seeding will if the floods database does not exist and the devDeployConfig permits it.
  Seeding will always occur for master deployments where the floods database does not exist.
**/
const writeSeedFlag = (client) => {
  return floodsExists(client)
  .then((exists) => {
    let shouldSeed;
    const branch = getBranch();
    if (branch !== "master") {
      shouldSeed = (!exists && devDeployConfig[branch] && devDeployConfig[branch].seed)
    } else {
      shouldSeed = !exists;
    }
    fs.writeFileSync(`${__dirname}/seed_flag.tmp`, `export SEED_FLAG=${shouldSeed}`);
  })
}

module.exports = writeSeedFlag

if (require.main === module) {
  commandLineRun(writeSeedFlag, "masterAdmin");
}
