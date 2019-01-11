const format = require('pg-format');
const commandLineRun = require("../helpers/commandLineRun")

const addSuperAdminUsers = (client) => {
  console.log("Adding superadmin@flo.ods and graphql@flo.ods users")
  // Set the jwt claim settings so the register user function works
  // Make sure they're local so we actually use the token outside of this script
  return client.query(format(
    `
      select set_config('jwt.claims.community_id', '1337', true);
      select set_config('jwt.claims.role', 'floods_super_admin', true);
      select floods.register_user(text 'Super', text 'Admin', text 'Superhero, Administrator', integer '1337', text '867-5309', text 'superadmin@flo.ods', text %L, text 'floods_super_admin');
      select floods.register_user(text 'Floods', text 'Graphql', text 'API', integer '1337', text '000-0000', text %L, text %L, text 'floods_super_admin', boolean 'true');
    `,
    process.env.PG_SUPER_ADMIN_PW, process.env.GRAPHQL_API_USR, process.env.GRAPHQL_API_PW
  ))
}

module.exports = addSuperAdminUsers;

if (require.main === module) {
  commandLineRun(addSuperAdminUsers, "floodsAdmin");
}
