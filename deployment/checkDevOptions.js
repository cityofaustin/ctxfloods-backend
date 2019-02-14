const fs = require('fs');

const devDeployConfig = require('./devDeployConfig.js');
const getBranch = require('./getBranch.js');

/**
  Creates a tmp file of custom environment variables for a dev/feature branch deployment.
  This is how custom environment variables in javascript can be applied to the scope of the deploy.sh script.

  To set these options for production branches, please apply changes directly to the deployment/vars/prod* files
  
  Any value of DB_DELETION_PROTECTION is interpretted as truthy by serverless framework
  Any value of ENABLE_PUSH_NOTIFICATIONS is interpretted as truthy by serverless framework.
  A custom AWS_SERVICE_NAME can be used to push changes to an existing deployment that doesn't share the branch name.
**/
const checkDevOptions = () => {
  const branch = getBranch();
  const config = devDeployConfig[branch];
  const exportCommands = [];

  if (config) {
    if (config.pushNotifications) {
      exportCommands.push(
        `export ENABLE_PUSH_NOTIFICATIONS=true`
      );
    }
    if (config.customServiceName) {
      exportCommands.push(
        `export AWS_SERVICE_NAME=ctxfloods-backend-${config.customServiceName}\nexport AWS_DB_INSTANCE_IDENTIFIER=ctxfloods-${config.customServiceName}`
      );
    }
    if (config.dbDeletionProtection) {
      exportCommands.push(
        `export DB_DELETION_PROTECTION=true`
      );
    }
    fs.writeFileSync(`${__dirname}/dev_options.tmp`, exportCommands.join('\n'));
  }
}

module.exports = checkDevOptions;

if (require.main === module) {
  checkDevOptions();
}
