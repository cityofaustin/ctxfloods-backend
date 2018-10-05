const {createDb, migrate} = require("postgres-migrations")

createDb("floods", {
  defaultDatabase: "floods", // optional, default: "postgres"
  user: process.env.PGUSERNAME,
  password: process.env.PGPASSWORD,
  host: process.env.PGENDPOINT,
  port: 5432,
})
.then(() => {
  return migrate({
    database: "floods",
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
    host: process.env.PGENDPOINT,
    port: 5432,
  }, "populateDB/migrations")
})
.catch((err) => {
  console.log(err);
  process.exit(1);
})
