const createCon = require('../createCon');

module.exports = createCon({
  host: process.env.PGENDPOINT,
  database: "floods",
  user: process.env.PGUSERNAME,
  password: process.env.PGPASSWORD
});
