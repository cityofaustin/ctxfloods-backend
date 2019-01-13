const format = require('pg-format');
const commandLineRun = require("../helpers/commandLineRun")

// Hack to get around graphql auth. Use this to manually reset admin users.
const manualPasswordReset = (client) => {
  const userId = null;
  const newPassword = null;

  return client.query(format(
    `
      select set_config('jwt.claims.user_id', %L, true);
      select floods.reset_password(text %L);
    `,
    userId, newPassword
  ))
}

commandLineRun(manualPasswordReset, "floodsAdmin");
