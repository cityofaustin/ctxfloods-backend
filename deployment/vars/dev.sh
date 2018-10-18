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
export GMAIL_PASSWORD=$TRAVIS_GMAIL_PASSWORD_DEV

# App
export JWT_SECRET=$TRAVIS_JWT_SECRET_DEV
export FRONTEND_URL=""
export BACKEND_PORT=5000
export ENABLE_SYNC_LEGACY=false
# GRAPHQL_ENDPOINT defined in serverless.yml

# Postgres
export PGUSERNAME=$TRAVIS_PGUSERNAME_DEV
export PGPASSWORD=$TRAVIS_PGPASSWORD_DEV
# PGENDPOINT assigned in serverless.yml
