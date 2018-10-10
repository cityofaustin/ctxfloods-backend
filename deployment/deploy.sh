#!/bin/bash

# Source env variables for given environment
# `bash deploy.sh prod` deploys with prod variables
# `bash deploy.sh prod-legacy-sync` deploys with prod-legacy-sync variables
# `bash deploy.sh` deploys with dev/feature branch variables
DEPLOY_ENV=$1
CURRENT_DIR=`dirname $BASH_SOURCE`
if \
  [ "$DEPLOY_ENV" != "prod" ] && \
  [ "$DEPLOY_ENV" != "prod-legacy-sync" ]
then
  DEPLOY_ENV=dev
fi
source $CURRENT_DIR/vars/$DEPLOY_ENV.sh

# Install "serverless" module and plugins
yarn global add serverless@1.32.0
yarn

# Deploy with serverless
sls deploy -v | tee out.tmp
if [ "${PIPESTATUS[0]}" != "0" ]; then
  exit 1
fi

# Run migrations
export PGENDPOINT=$(grep "PgEndpoint" out.tmp | cut -f2- -d: | cut -c2-)
export GRAPHQL_ENDPOINT=$(grep "GraphqlEndpoint" out.tmp | cut -f2- -d: | cut -c2-)
node ./db/migrateAndSeed.js
if [ $? != 0 ]; then
  exit 1
fi

# Build-Schema
# TODO - remove this hack step and replace with lambda service during graphile update
echo Building Schema
node ./pgCatalog/buildPgCatalog.js
if [ $? != 0 ]; then
  exit 1
fi

sls deploy -f graphql
if [ $? != 0 ]; then
  exit 1
fi

rm out.tmp
