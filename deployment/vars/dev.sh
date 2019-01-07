# AWS
case $TRAVIS_EVENT_TYPE in
  push)
    # Set to branch name during push builds
    export AWS_SERVICE_NAME=ctxfloods-backend-$TRAVIS_BRANCH
    ;;
  pull_request)
    # Set to origin branch name during pull requests
    export AWS_SERVICE_NAME=ctxfloods-backend-$TRAVIS_PULL_REQUEST_BRANCH
    ;;
  api | cron)
    # The final 2 Travis Event Types.
    # We should not run across these cases with our script.
    # But just in case, set the suffix to the Travis job id.
    export AWS_SERVICE_NAME=ctxfloods-backend-$TRAVIS_EVENT_TYPE-$TRAVIS_JOB_ID
    ;;
esac
export AWS_ACCESS_KEY_ID=$TRAVIS_ACCESS_KEY_ID_DEV
export AWS_SECRET_ACCESS_KEY=$TRAVIS_SECRET_ACCESS_KEY_DEV
export AWS_STAGE=dev

# Gmail
export GMAIL_ADDRESS=$TRAVIS_GMAIL_ADDRESS_DEV
export GMAIL_CLIENT_ID=$TRAVIS_GMAIL_CLIENT_ID
export GMAIL_CLIENT_SECRET=$TRAVIS_GMAIL_CLIENT_SECRET
export GMAIL_REFRESH_TOKEN=$TRAVIS_GMAIL_REFRESH_TOKEN

# App
export JWT_SECRET=$TRAVIS_JWT_SECRET_DEV
export BACKEND_PORT=5000
# ENABLE_SYNC_LEGACY disabled. Interpretted as truthy by serverless.yml when any string is passed.
# GRAPHQL_ENDPOINT defined in serverless.yml
# ENABLE_PUSH_NOTIFICATIONS can be defined in devDeployConfig.
export AUSTIN_DATA_APP_TOKEN=$TRAVIS_AUSTIN_DATA_APP_TOKEN_DEV

# Postgres
export PG_MASTER_USR=$TRAVIS_PG_MASTER_USR_DEV
export PG_MASTER_PW=$TRAVIS_PG_MASTER_PW_DEV
export PG_API_USR=floods_graphql
export PG_API_PW=$TRAVIS_PG_API_PW_DEV
# PG_ENDPOINT assigned in serverless.yml
