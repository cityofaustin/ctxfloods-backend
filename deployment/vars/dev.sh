# AWS
case $TRAVIS_EVENT_TYPE in
  push)
    # Set to branch name during push builds
    export AWS_SERVICE_NAME=ctxfloods-backend-$TRAVIS_BRANCH
    export AWS_DB_INSTANCE_IDENTIFIER=ctxfloods-$TRAVIS_BRANCH
    ;;
  pull_request)
    # Set to origin branch name during pull requests
    export AWS_SERVICE_NAME=ctxfloods-backend-$TRAVIS_PULL_REQUEST_BRANCH
    export AWS_DB_INSTANCE_IDENTIFIER=ctxfloods-$TRAVIS_PULL_REQUEST_BRANCH
    ;;
  api | cron)
    # The final 2 Travis Event Types.
    # We should not run across these cases with our script.
    # But just in case, set the suffix to the Travis job id.
    export AWS_SERVICE_NAME=ctxfloods-backend-$TRAVIS_EVENT_TYPE-$TRAVIS_JOB_ID
    export AWS_DB_INSTANCE_IDENTIFIER=ctxfloods-$TRAVIS_EVENT_TYPE-$TRAVIS_JOB_ID
    ;;
esac
export AWS_ACCESS_KEY_ID=$TRAVIS_ACCESS_KEY_ID_DEV
export AWS_SECRET_ACCESS_KEY=$TRAVIS_SECRET_ACCESS_KEY_DEV
export AWS_STAGE=dev
export SECURE_WITH_VPC=false #Can be overwritten in devDeployConfig

# Gmail
export GMAIL_ADDRESS=$TRAVIS_GMAIL_ADDRESS_DEV
export GMAIL_CLIENT_ID=$TRAVIS_GMAIL_CLIENT_ID
export GMAIL_CLIENT_SECRET=$TRAVIS_GMAIL_CLIENT_SECRET
export GMAIL_REFRESH_TOKEN=$TRAVIS_GMAIL_REFRESH_TOKEN

# App
export NODE_ENV=dev
export JWT_SECRET=$TRAVIS_JWT_SECRET_DEV
export BACKEND_PORT=5000
# ENABLE_SYNC_LEGACY disabled. Interpretted as truthy by serverless.yml when any string is passed.
# GRAPHQL_ENDPOINT defined in serverless.yml
# ENABLE_PUSH_NOTIFICATIONS can be defined in devDeployConfig.
export AUSTIN_DATA_APP_TOKEN=$TRAVIS_AUSTIN_DATA_APP_TOKEN_DEV
export GRAPHQL_API_USR=graphql@flo.ods
export GRAPHQL_API_PW=$TRAVIS_GRAPHQL_API_PW_DEV
export DISABLE_QUERY_LOG=false

# Postgres
# Changing PG_MASTER_USR and PG_MASTER_PW here will apply changes to both the database and the application.
# However, changing other values (PG_API_USR, PG_API_PW, PG_SUPER_ADMIN_PW) will only apply changes to the application.
# Those values are only applied to the database on initialization, not Stack updates.
# To change these values after creating the database, you must change them in the database manually as well in the Travis environment variable settings.
export PG_PORT=5432
export PG_MASTER_USR=$TRAVIS_PG_MASTER_USR_DEV
export PG_MASTER_PW=$TRAVIS_PG_MASTER_PW_DEV
export PG_API_USR=floods_graphql
export PG_API_PW=$TRAVIS_PG_API_PW_DEV
export PG_SUPER_ADMIN_PW=$TRAVIS_PG_SUPER_ADMIN_PW_DEV # only used during initialization
# DB_DELETION_PROTECTION assigned in devDeployConfig
export DB_BACKUP_RETENTION_PERIOD=1
# PG_ENDPOINT assigned in serverless.yml
