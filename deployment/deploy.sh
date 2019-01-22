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

# Check if deployed db already exists
node $CURRENT_DIR/writeDbFlags.js
if [ $? != 0 ]; then
  echo "db flag script failed"
  exit 1
fi
source $CURRENT_DIR/db_flags.tmp

# Create Serverless Bundle
sls package -v
if [ $? != 0 ]; then
  echo "sls package failed"
  exit 1
fi

# Add postgraphile.cache to bundle if DB exists
if [ $DB_EXISTS_FLAG = "true" ]; then
  bash ./bundleGraphqlHandler
  if [ $? != 0 ]; then
    exit 1
  fi
fi

# Deploy bundled serverless package
sls deploy -p $CURRENT_DIR/../.serverless -v | tee out.tmp
if [ "${PIPESTATUS[0]}" != "0" ]; then
  echo "sls deploy failed"
  exit 1
fi
export PG_ENDPOINT=$(grep "PgEndpoint" out.tmp | cut -f2- -d: | cut -c2-)
export GRAPHQL_ENDPOINT=$(grep "GraphqlEndpoint" out.tmp | cut -f2- -d: | cut -c2-)

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

# If its a new deployment (as indicated by writeDbFlags.js), then seed data
if [ $SEED_FLAG = "true" ]; then
  node $CURRENT_DIR/../db/scripts/seed.js
  if [ $? != 0 ]; then
    echo "seed script failed"
    exit 1
  fi
fi

# If DB instance is new, re-deploy graphql Lambda function with postgraphile schema
if [ $DB_EXISTS_FLAG = "false" ]; the
  sls package -v
  if [ $? != 0 ]; then
    echo "sls package failed"
    exit 1
  fi

  bash ./bundleGraphqlHandler
  if [ $? != 0 ]; then
    exit 1
  fi

  sls deploy -p $CURRENT_DIR/../.serverless -f graphql
  if [ $? != 0 ]; then
    echo "sls deploy -f graphql failed"
    exit 1
  fi
fi

rm $CURRENT_DIR/db_flags.tmp
rm out.tmp
