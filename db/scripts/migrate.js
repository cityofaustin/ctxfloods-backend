const {migrate} = require("postgres-migrations")
const path = require('path');

const runMigrate = () => {
  console.log("Migrate is running now!");
  return migrate({
    database: "floods",
    user: process.env.PG_MASTER_USR,
    password: process.env.PG_MASTER_PW,
    host: process.env.PG_ENDPOINT,
    port: 5432,
  }, path.join(__dirname, "/../../populateDB/migrations"))
}

module.exports = runMigrate;

if (require.main === module) {
  runMigrate()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
}
