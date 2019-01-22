const fs = require('fs');
const aws = require('aws-sdk');
aws.config.update({region:'us-east-1'});
const cloudformation = new aws.CloudFormation();

/**
  Retrieves PG_ENDPOINT and GRAPHQL_ENDPOINT stack outputs from AWS.
  If "strict" === true, then we throw an error if the Stack does not exist
**/
const getStackOutputs = (strict) => {
  const stackName = `${process.env.AWS_SERVICE_NAME}-${process.env.AWS_STAGE}`;

  return cloudformation.describeStacks({
    StackName: stackName
  }).promise()
  .then(data => {
    const PG_ENDPOINT = data.Stacks.Outputs.find(o => o.OutputKey === "PgEndpoint").OutputValue;
    const GRAPHQL_ENDPOINT = data.Stacks.Outputs.find(o => o.OutputKey === "GraphqlEndpoint").OutputValue;
    fs.writeFileSync(`${__dirname}/stack_outputs.tmp`, `export PG_ENDPOINT=${PG_ENDPOINT}\nexport GRAPHQL_ENDPOINT=${GRAPHQL_ENDPOINT}\n export STACK_EXISTS=true`);
  })
  .catch(err => {
    if (err.code === "ValidationError") {
      if (strict) {
        console.log(err)
        process.exit(1)
      } else {
        fs.writeFileSync(`${__dirname}/stack_outputs.tmp`,`export STACK_EXISTS=false`);
      }
    }
  })
}

module.exports = getStackOutputs;

if (require.main === module) {
  getStackOutputs();
}
