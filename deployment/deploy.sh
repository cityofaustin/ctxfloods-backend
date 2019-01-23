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

# Get Stack output variables if Stack already exists
node $CURRENT_DIR/getStackOutputs.js
if [ $? != 0 ]; then
  echo "db flag script failed"
  exit 1
fi
source $CURRENT_DIR/stack_outputs.tmp

if [ ! -z $PG_ENDPOINT ]; then
  # If Stack and Database exist, check if our migrations are up to date
  node $CURRENT_DIR/checkMigrations.js
  if [ $? != 0 ]; then
    echo "migration check failed"
    exit 1
  fi
  source $CURRENT_DIR/migrations_flag.tmp
else
  MIGRATIONS_UP_TO_DATE=false
fi

# Create Serverless Bundle
sls package -v
if [ $? != 0 ]; then
  echo "sls package failed"
  exit 1
fi

# Add postgraphile.cache to bundle if deployed migrations are up to date
if [[ $MIGRATIONS_UP_TO_DATE = "true" ]]; then
  bash $CURRENT_DIR/bundleGraphqlHandler.sh
  if [ $? != 0 ]; then
    exit 1
  fi
fi

# Deploy bundled serverless package
sls deploy -p $CURRENT_DIR/../.serverless -v
if [ $? != 0 ]; then
  echo "sls deploy failed"
  exit 1
fi

# Source variables if Stack is new
if [[ $STACK_EXISTS = "false" ]]; then
  node $CURRENT_DIR/getStackOutputsStrict.js
  if [ $? != 0 ]; then
    echo "stack output sourcing failed"
    exit 1
  fi
  source $CURRENT_DIR/stack_outputs.tmp
fi

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

# If its a new deployment (as indicated by writeDbFlags.js), then seed data
if [[ $SEED_FLAG = "true" ]]; then
  node $CURRENT_DIR/../db/scripts/seed.js
  if [ $? != 0 ]; then
    echo "seed script failed"
    exit 1
  fi
fi

# If CloudFormation Stack is new or if migrations were not up to date, then re-deploy graphql Lambda function with postgraphile schema
if [[ $STACK_EXISTS = "false" ]] || [[ $MIGRATIONS_UP_TO_DATE = "false" ]]; then
  sls package -v
  if [ $? != 0 ]; then
    echo "sls package failed"
    exit 1
  fi

  bash $CURRENT_DIR/bundleGraphqlHandler.sh
  if [ $? != 0 ]; then
    exit 1
  fi

  sls deploy -p $CURRENT_DIR/../.serverless -f graphql
  if [ $? != 0 ]; then
    echo "sls deploy -f graphql failed"
    exit 1
  fi
fi

# Clean up .tmp files
[ -f $CURRENT_DIR/push_notification_flag.tmp ] && rm $CURRENT_DIR/push_notification_flag.tmp
[ -f $CURRENT_DIR/custom_aws_service_name.tmp ] && rm $CURRENT_DIR/custom_aws_service_name.tmp
[ -f $CURRENT_DIR/seed_flag.tmp ] && rm $CURRENT_DIR/seed_flag.tmp
[ -f $CURRENT_DIR/stack_outputs.tmp ] && rm $CURRENT_DIR/stack_outputs.tmp
[ -f $CURRENT_DIR/migrations_flag.tmp ] && rm $CURRENT_DIR/migrations_flag.tmp
