#!/bin/bash
CURRENT_DIR=`dirname $BASH_SOURCE`

echo "Building Schema"
node $CURRENT_DIR/../pgCatalog/buildPgCatalog.js
if [ $? != 0 ]; then
  echo "buildPgCatalog failed"
  exit 1
fi

# "package: include: ..." within serverless.yml is incompatible with serverless-webpack, hence the workaround
# http://nmajor.com/posts/serverless-framework-executable-binaries-aws-lambda
# Warning: this zip commands depends on a relative path.
# If the cwd ever changes during the deployment process, you should use node-archiver for zipping instead.
zip -9Xr $CURRENT_DIR/../.serverless/graphql.zip pgCatalog/postgraphile.cache

# Update SHA hash for modified function zip file
export SHA=$(openssl dgst -sha256 -binary $CURRENT_DIR/../.serverless/graphql.zip | openssl enc -base64)
export NORMALIZED_SHA=$(echo $SHA | sed -e "s/[^0-9A-Za-z]//g")
if [ -z "$SHA" ]; then
  exit 1
fi

node $CURRENT_DIR/updateCodeSha.js
if [ $? != 0 ]; then
  exit 1
fi
