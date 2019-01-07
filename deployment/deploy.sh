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

# Check if push notifications will be required
node $CURRENT_DIR/writePushNotificationFlag.js
if [ $? != 0 ]; then
  echo "write push notification flag script failed"
  exit 1
fi
# Source ENABLE_PUSH_NOTIFICATIONS if it exists
[ -f $CURRENT_DIR/push_notification_flag.tmp ] && source $CURRENT_DIR/push_notification_flag.tmp

# Check if push notifications will be required
node $CURRENT_DIR/writeCustomServiceName.js
if [ $? != 0 ]; then
  echo "writeCustomServiceName script failed"
  exit 1
fi
# Source custom AWS_SERVICE_NAME if it exists
[ -f $CURRENT_DIR/custom_aws_service_name.tmp ] && source $CURRENT_DIR/custom_aws_service_name.tmp

# Install "serverless" module and plugins
yarn global add serverless@1.32.0
yarn

# Create s3 bucket
node $CURRENT_DIR/createS3Bucket.js
if [ $? != 0 ]; then
  echo "Bucket build failed"
  exit 1
fi

# Deploy with serverless
sls deploy -v | tee out.tmp
if [ "${PIPESTATUS[0]}" != "0" ]; then
  echo "sls deploy failed"
  exit 1
fi
export PG_ENDPOINT=$(grep "PgEndpoint" out.tmp | cut -f2- -d: | cut -c2-)
export GRAPHQL_ENDPOINT=$(grep "GraphqlEndpoint" out.tmp | cut -f2- -d: | cut -c2-)

# Check if seeding will be required
node $CURRENT_DIR/writeSeedFlag.js
if [ $? != 0 ]; then
  echo "seed flag script failed"
  exit 1
fi

# Initialize floods database
node $CURRENT_DIR/../db/scripts/initialize.js
if [ $? != 0 ]; then
  echo "initialize db script failed"
  exit 1
fi

# Run migrations
node $CURRENT_DIR/../db/scripts/migrate.js
if [ $? != 0 ]; then
  echo "migrate script failed"
  exit 1
fi

# If its a new deployment (as indicated by createS3Bucket.js), then seed data
source $CURRENT_DIR/seed_flag.tmp
if [ $SEED_FLAG = "true" ]; then
  node $CURRENT_DIR/../db/scripts/addApiUser.js
  if [ $? != 0 ]; then
    echo "add API user script failed"
    exit 1
  fi

  node $CURRENT_DIR/../db/scripts/seed.js
  if [ $? != 0 ]; then
    echo "seed script failed"
    exit 1
  fi
fi

# Build Graphql Schema
echo Building Schema
node $CURRENT_DIR/../pgCatalog/buildPgCatalog.js
if [ $? != 0 ]; then
  echo "buildPgCatalog failed"
  exit 1
fi

# Deploy graphql Lambda function with schema
sls deploy -f graphql
if [ $? != 0 ]; then
  echo "sls deploy -f graphql failed"
  exit 1
fi

rm $CURRENT_DIR/seed_flag.tmp
rm out.tmp
