require('promise.prototype.finally').shim();
const fs = require('fs');
const _ = require('lodash');

const getClient = require('../db/helpers/getClient');
const floodsExists = require('../db/scripts/floodsExists');
const commandLineRun = require('../db/helpers/commandLineRun');

/**
  Check if deployed Migrations are up to date (i.e. were all local migration files already run on deployed database?).
  If so, the floods database can be introspected, and the postgraphile.cache can be added to the bundled graphqlHandler.
  Otherwise, the graphqlHandler will be re-bundled and deployed after the migrations are up to date.
**/
const checkMigrations = () => {
  let floodsClient, masterClient, errFlag = false, migrationsUpToDate = false;

  masterClient = getClient({clientType: "masterAdmin"});
  return masterClient.connect()
  .then(() => floodsExists(masterClient))
  .then((exists) => {
    if (exists) {
      floodsClient = getClient({clientType: "floodsAdmin"})
      return floodsClient.connect()
      .then(() => {
        return floodsClient.query("select max(id) from migratiions");
      })
      .then((result) => {
        const maxDeployedMigration = Number(result.rows[0].max);
        const migrationFiles = fs.readdirSync(`${__dirname}/../populateDB/migrations`);
        const maxLocalMigration = _.max(migrationFiles.map(fileName => Number(fileName.slice(0,3))));
        if (maxLocalMigration === maxDeployedMigration) {
          migrationsUpToDate = true;
        }
      })
    }
  })
  .then(() => fs.writeFileSync(`${__dirname}/migrations_flag.tmp`, `export MIGRATIONS_UP_TO_DATE=${migrationsUpToDate}`))
  .catch((err)=>{
    if (err.code === "42P01"){
      // error thrown if "migrations" table not created yet
      fs.writeFileSync(`${__dirname}/migrations_flag.tmp`, `export MIGRATIONS_UP_TO_DATE=false`)
    } else {
      console.log(err);
      errFlag = true;
    }
  })
  .finally(() => {
    if (floodsClient) return client.end()
  })
  .finally(() => {
    if (masterClient) return client.end()
  })
  .finally(() => {
    if (errFlag) process.exit(1);
    process.exit();
  })
}

if (require.main === module) {
  checkMigrations();
}
