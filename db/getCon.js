const createCon = require('./createCon');

module.exports = {
  initial: createCon(
    process.env.PGENDPOINT,
    "",
    process.env.PGUSERNAME,
    ""
  )
  // app: () => createCon(
  //   process.env.PGENDPOINT,
  //   "floods",
  //   process.env.PGUSERNAME,
  //   process.env.PGPASSWORD
  // ),
  // graphql: () => createCon(
  //   process.env.PGENDPOINT,
  //   "floods",
  //   "floods_postgraphql",
  //   "xyz"
  // )
};
