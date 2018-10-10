const {migrate} = require("postgres-migrations")
const path = require('path');

const runMigrate = () => {
  console.log("Migrate is running now!");
  return migrate({
    database: "floods",
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
    host: process.env.PGENDPOINT,
    port: 5432,
  }, path.join(__dirname, "/../populateDB/migrations"))
}

module.exports = runMigrate;

if (require.main === module) {
  runMigrate()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
}
