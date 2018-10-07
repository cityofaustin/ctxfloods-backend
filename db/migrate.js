const {migrate} = require("postgres-migrations")
const path = require('path');

module.exports = () => {
  console.log("Migrate is running now!");
  return migrate({
    database: "floods",
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
    host: process.env.PGENDPOINT,
    port: 5432,
  }, path.join(__dirname, "/../populateDB/migrations"))
}
