#!/bin/bash
CURRENT_DIR=`dirname $BASH_SOURCE`

echo "Building Schema"
node $CURRENT_DIR/../pgCatalog/buildPgCatalog.js
if [ $? != 0 ]; then
  echo "buildPgCatalog failed"
  exit 1
fi

echo "What is inside graphql.zip?"
unzip -l $CURRENT_DIR/../.serverless/graphql.zip
if [ -f $CURRENT_DIR/../pgCatalog/postgraphile.cache ]; then
  echo "k the cache exists"
else
  echo "hey the cache doesn't exist"
fi

# "package: include: ..." within serverless.yml is incompatible with serverless-webpack, hence the workaround
# http://nmajor.com/posts/serverless-framework-executable-binaries-aws-lambda
zip -r $CURRENT_DIR/../.serverless/graphql.zip . -i $CURRENT_DIR/../pgCatalog/*.cache

# Update SHA hash for modified function zip file
export SHA=$(openssl dgst -sha256 -binary $CURRENT_DIR/../.serverless/graphql.zip | openssl enc -base64)
if [ -z "$SHA" ]; then
  exit 1
fi

node $CURRENT_DIR/updateCodeSha.js
if [ $? != 0 ]; then
  exit 1
fi
