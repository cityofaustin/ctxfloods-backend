const createCon = require('../createCon');

module.exports = createCon(
  process.env.PGENDPOINT,
  "postgres",
  process.env.PGUSERNAME,
  ""
)
