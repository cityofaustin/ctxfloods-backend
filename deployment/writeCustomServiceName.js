const fs = require('fs');

const devDeployConfig = require('./devDeployConfig.js');
const getBranch = require('./getBranch.js');

/**
  Exports a custom AWS_SERVICE_NAME environment variable.
  This can be used to push changes to an existing deployment that doesn't share the branch name.
  Can push to an environment like "sandbox-1" to save deployment time.
  If "customServiceName" is not an existing deployment, then no time will be saved because a new CloudFormation must still be created.
**/
const writeCustomServiceName = () => {
  const branch = getBranch();
  if (devDeployConfig[branch] && devDeployConfig[branch].customServiceName) {
    fs.writeFileSync(`${__dirname}/custom_aws_service_name.tmp`,
      `export AWS_SERVICE_NAME=ctxfloods-backend-${devDeployConfig[branch].customServiceName}\nexport AWS_DB_INSTANCE_IDENTIFIER=ctxfloods-${devDeployConfig[branch].customServiceName}`
    );
  }
}

module.exports = writeCustomServiceName;

if (require.main === module) {
  writeCustomServiceName();
}
