const fs = require('fs');

const floodsExists = require('../db/scripts/floodsExists');
const commandLineRun = require('../db/helpers/commandLineRun');
const devDeployConfig = require('./devDeployConfig.js');
const getBranch = require('./getBranch.js');

let masterClient;

/**
  Write a SEED_FLAG to a file.
  This allows you to propagate that environment variable to the surrounding bash script scope.
  Seeding will take place in a further step in the deploy.sh script.

  Seeding will if the floods database does not exist and the devDeployConfig permits it.
  Seeding will always occur for master deployments where the floods database does not exist.

  Write a DB_EXISTS_FLAG to a file.
  This lets us know if we can introspect an existing database for postgraphile.
  Otherwise we must introspect after deployment and re-deploy the graphqlHandler a second time.
**/
const writeDbFlags = (client) => {
  return floodsExists(client)
  .then((exists) => {
    let shouldSeed;
    const branch = getBranch();
    if (branch !== "master") {
      shouldSeed = (!exists && !!devDeployConfig[branch] && !!devDeployConfig[branch].seed)
    } else {
      shouldSeed = !exists;
    }
    fs.writeFileSync(`${__dirname}/db_flags.tmp`, `export SEED_FLAG=${shouldSeed}\nexport DB_EXISTS_FLAG=${exists}`);
  })
}

module.exports = writeDbFlags

if (require.main === module) {
  commandLineRun(writeDbFlags, "masterAdmin");
}
