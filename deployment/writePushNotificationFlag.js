const fs = require('fs');

const devDeployConfig = require('./devDeployConfig.js');
const getBranch = require('./getBranch.js');

/**
  If branch=master or if pushNotifications option is set to "true" in devDeployConfig,
  then export ENABLE_PUSH_NOTIFICATIONS env variable for use in serverless.yml.

  Any value of ENABLE_PUSH_NOTIFICATIONS is interpretted as truthy by serverless framework.
**/
const writePushNotificationFlag = () => {
  const branch = getBranch();
  if (devDeployConfig[branch] && devDeployConfig[branch].pushNotifications) {
    fs.writeFileSync(`${__dirname}/push_notification_flag.tmp`, `export ENABLE_PUSH_NOTIFICATIONS=true`);
  }
}

module.exports = writePushNotificationFlag;

if (require.main === module) {
  writePushNotificationFlag();
}
