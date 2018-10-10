const Client = require('pg').Client;

/**
  Get a single client for a database.
  The host, users, and passwords are taken from environment variables.

  @param clientType - either "floodsAPI" or "master"
  "floodsAPI" will point to "floods" database and login with the floods_api user.
  "master" will point to default "postgres" database and login with master username/password.
  "master" should only be used for database initialization/migration scripts.
  Both point to the PGENDPOINT defined in environment variables.
**/
const getClient = (clientType) => {
  let user, password, database;
  if (clientType === "floodsAPI") {
    user = process.env.PGUSERNAME;
    password = process.env.PGPASSWORD;
    database = "floods";
  } else if (clientType === "master") {
    user = process.env.PGUSERNAME;
    password = process.env.PGPASSWORD;
    database = "postgres";
  } else {
    throw new error(`Please enter a valid client type; ex. "floodsAPI"`)
  }

  const client = new Client({
    host: process.env.PGENDPOINT,
    port: 5432,
    user: user,
    password: password,
    database: database
  });

  process.on('SIGTERM', () => {
    console.log("Signal Terminated - closing client");
    client.end();
  });

  process.on('SIGINT', () => {
    console.log("Signal Interrupted - closing client");
    client.end();
  });

  return client.connect()
  .then(() => {
    return client
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
};

module.exports = getClient;
