const fs = require('fs');
const _ = require('lodash');
const updateFileName = `${__dirname}/../.serverless/cloudformation-template-update-stack.json`;
const stateFileName = `${__dirname}/../.serverless/serverless-state.json`;
const updateFile = require(updateFileName);
const stateFile = require(stateFileName);
const sha = process.env.SHA;

const keys = Object.keys(updateFile.Resources);
const graphqlLambdaVersion = _.find(keys, k => (k.match(/GraphqlLambdaVersion*/) !== null));
updateFile.Resources[graphqlLambdaVersion].Properties.CodeSha256 = process.env.SHA;
stateFile.service.provider.compiledCloudFormationTemplate.Resources[graphqlLambdaVersion].Properties.CodeSha256 = process.env.SHA;

fs.writeFile(updateFileName, JSON.stringify(updateFile, null, 2), (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
fs.writeFile(stateFileName, JSON.stringify(stateFile, null, 2), (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
