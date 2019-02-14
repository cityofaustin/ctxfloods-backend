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

# Check if custom AWS service name will be required
echo ":: Checking for CustomServiceName"
node $CURRENT_DIR/writeCustomServiceName.js
if [ $? != 0 ]; then
  echo ":: writeCustomServiceName script failed"
  exit 1
fi
# Source custom AWS_SERVICE_NAME if it exists
[ -f $CURRENT_DIR/custom_aws_service_name.tmp ] && source $CURRENT_DIR/custom_aws_service_name.tmp

# Install "serverless" module and plugins
yarn global add serverless@1.32.0
yarn --production=false

# Create s3 bucket
echo ":: Building S3 Bucket"
node $CURRENT_DIR/createS3Bucket.js
if [ $? != 0 ]; then
  echo ":: Bucket build failed"
  exit 1
fi

# Get Stack output variables if Stack already exists
echo ":: Checking for existing Stack Outputs"
node $CURRENT_DIR/getStackOutputs.js
if [ $? != 0 ]; then
  echo ":: Stack Outputs check failed"
  exit 1
fi
source $CURRENT_DIR/stack_outputs.tmp
echo ":: Stack Outputs check succeeded, STACK_EXISTS=${STACK_EXISTS}"

# If Stack and Database exist, check if our migrations are up to date
echo ":: Checking if migrations are up to date"
if [ ! -z $PG_ENDPOINT ]; then
  node $CURRENT_DIR/checkMigrations.js
  if [ $? != 0 ]; then
    echo ":: Migration check failed"
    exit 1
  else
    source $CURRENT_DIR/migrations_flag.tmp
  fi
else
  MIGRATIONS_UP_TO_DATE=false
fi
echo ":: Migration check succeeded, MIGRATIONS_UP_TO_DATE=${MIGRATIONS_UP_TO_DATE}"

# Create Serverless Bundle
echo ":: Creating serverless.js Bundle"
sls package -v
if [ $? != 0 ]; then
  echo ":: sls package failed"
  exit 1
fi

# Add postgraphile.cache to bundle if deployed migrations are up to date
if [[ $MIGRATIONS_UP_TO_DATE = "true" ]]; then
  echo ":: Migrations are up to date, adding postgraphile.cache to graphqlHandler package"
  bash $CURRENT_DIR/bundleGraphqlHandler.sh
  if [ $? != 0 ]; then
    echo ":: Bundling graphqlHandler failed"
    exit 1
  else
    echo ":: Bundling graphqlHandler succeeded"
  fi
fi

# Deploy bundled serverless package
echo ":: Deploying bundled serverless package"
sls deploy -p $CURRENT_DIR/../.serverless -v
if [ $? != 0 ]; then
  echo ":: sls deploy failed"
  exit 1
fi

# Source variables if Stack is new
if [[ $STACK_EXISTS = "false" ]]; then
  echo ":: Sourcing new stack outputs"
  node $CURRENT_DIR/getStackOutputsStrict.js
  if [ $? != 0 ]; then
    echo ":: stack output sourcing failed"
    exit 1
  fi
  source $CURRENT_DIR/stack_outputs.tmp
fi

# Check if seeding will be required
echo ":: Checking if seeding is required"
node $CURRENT_DIR/writeSeedFlag.js
if [ $? != 0 ]; then
  echo ":: seed flag script failed"
  exit 1
fi
source $CURRENT_DIR/seed_flag.tmp
echo ":: Seeding check succeeded, SEED_FLAG=${SEED_FLAG}"

# Initialize floods database
echo ":: Initializing Floods Database"
node $CURRENT_DIR/../db/scripts/initialize.js
if [ $? != 0 ]; then
  echo ":: initialize db script failed"
  exit 1
fi

# Run migrations
echo ":: Running Migrations"
node $CURRENT_DIR/../db/scripts/migrate.js
if [ $? != 0 ]; then
  echo ":: migrate script failed"
  exit 1
fi

# If its a new deployment (as indicated by writeSeedFlag.js), then seed data
if [[ $SEED_FLAG = "true" ]]; then
  echo ":: Starting seed script"
  node $CURRENT_DIR/../db/scripts/seed.js
  if [ $? != 0 ]; then
    echo "seed script failed"
    exit 1
  fi
fi

# If CloudFormation Stack is new or if migrations were not up to date, then re-deploy graphql Lambda function with postgraphile schema
if [[ $STACK_EXISTS = "false" ]] || [[ $MIGRATIONS_UP_TO_DATE = "false" ]]; then
  echo ":: MIGRATIONS_UP_TO_DATE=${MIGRATIONS_UP_TO_DATE}"
  echo ":: STACK_EXISTS=${STACK_EXISTS}"
  echo ":: Re-packaging serverless.js bundle"
  sls package -v
  if [ $? != 0 ]; then
    echo "sls package failed"
    exit 1
  fi

  echo ":: adding postgraphile.cache to graphqlHandler package"
  bash $CURRENT_DIR/bundleGraphqlHandler.sh
  if [ $? != 0 ]; then
    echo ":: Bundling graphqlHandler failed"
    exit 1
  else
    echo ":: Bundling graphqlHandler succeeded"
  fi


  # Note: "sls -f graphql" is incompatible with "sls -p ...", so we must redeploy everything during first deployment
  echo ":: Re-deploying bundled serverless package"
  sls deploy -p $CURRENT_DIR/../.serverless
  if [ $? != 0 ]; then
    echo "sls deploy (with new graphql bundle) failed"
    exit 1
  fi
fi

# Clean up .tmp files
[ -f $CURRENT_DIR/push_notification_flag.tmp ] && rm $CURRENT_DIR/push_notification_flag.tmp
[ -f $CURRENT_DIR/custom_aws_service_name.tmp ] && rm $CURRENT_DIR/custom_aws_service_name.tmp
[ -f $CURRENT_DIR/seed_flag.tmp ] && rm $CURRENT_DIR/seed_flag.tmp
[ -f $CURRENT_DIR/stack_outputs.tmp ] && rm $CURRENT_DIR/stack_outputs.tmp
[ -f $CURRENT_DIR/migrations_flag.tmp ] && rm $CURRENT_DIR/migrations_flag.tmp

exit 0
