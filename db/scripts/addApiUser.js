const format = require('pg-format');
const commandLineRun = require("../helpers/commandLineRun")

const addApiUser = (client) => {
  console.log("Adding floods_graphql user")
  return client.query(format(
    `
      create user floods_graphql login password %L;
      grant floods_super_admin to floods_graphql;
      grant floods_password_resetter to floods_graphql;
    `,
    process.env.PG_API_PW)
  )
}

module.exports = addApiUser;

if (require.main === module) {
  commandLineRun(addApiUser, "floodsAdmin");
}
