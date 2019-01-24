const fs = require('fs');
const _ = require('lodash');
const updateFileName = `${__dirname}/../.serverless/cloudformation-template-update-stack.json`;
const stateFileName = `${__dirname}/../.serverless/serverless-state.json`;
const updateFile = require(updateFileName);
const stateFile = require(stateFileName);
const sha = process.env.SHA;

const keys = Object.keys(updateFile.Resources);
const oldGraphqlLambdaVersion = _.find(keys, k => (k.match(/GraphqlLambdaVersion*/) !== null));
// Create new GraphqlLambdaVersion LogicalID, roughly following serverless' pattern
const newGraphqlLambdaVersion = `GraphqlLambdaVersion${process.env.NORMALIZED_SHA}`;

// Update graphQL Lambda's VersionID and CodeSha256 in cloudformation-template-update-stack.json
updateFile.Resources[newGraphqlLambdaVersion] = updateFile.Resources[oldGraphqlLambdaVersion];
delete updateFile.Resources[oldGraphqlLambdaVersion];
updateFile.Resources[newGraphqlLambdaVersion].Properties.CodeSha256 = process.env.SHA;
updateFile.Outputs.GraphqlLambdaFunctionQualifiedArn.Value.Ref = newGraphqlLambdaVersion;

// Update graphQL Lambda's VersionID and CodeSha256 in serverless-state.json
stateFile.service.provider.compiledCloudFormationTemplate.Resources[newGraphqlLambdaVersion] =
  stateFile.service.provider.compiledCloudFormationTemplate.Resources[oldGraphqlLambdaVersion];
delete stateFile.service.provider.compiledCloudFormationTemplate.Resources[oldGraphqlLambdaVersion];
stateFile.service.provider.compiledCloudFormationTemplate.Resources[newGraphqlLambdaVersion].Properties.CodeSha256 = process.env.SHA;
stateFile.service.provider.compiledCloudFormationTemplate.Outputs.GraphqlLambdaFunctionQualifiedArn.Value.Ref = newGraphqlLambdaVersion;

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
