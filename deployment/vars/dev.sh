# AWS
case $TRAVIS_EVENT_TYPE in
  push)
    # Set to branch name during push builds
    export AWS_SERVICE_NAME=ctx-floods-backend-$TRAVIS_BRANCH
    ;;
  pull_request)
    # Set to origin branch name during pull requests
    export AWS_SERVICE_NAME=ctx-floods-backend-$TRAVIS_PULL_REQUEST_BRANCH
    ;;
  api | cron)
    # The final 2 Travis Event Types.
    # We should not run across these cases with our script.
    # But just in case, set the suffix to the Travis job id.
    export AWS_SERVICE_NAME=ctx-floods-backend-$TRAVIS_EVENT_TYPE-$TRAVIS_JOB_ID
    ;;
esac
export AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID_DEV_TRAVIS
export AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY_DEV_TRAVIS
export AWS_STAGE=dev

# Gmail
export GMAIL_ADDRESS=$GMAIL_ADDRESS_DEV_TRAVIS
export GMAIL_PASSWORD=$GMAIL_PASSWORD_DEV_TRAVIS

# App
export JWT_SECRET=$JWT_SECRET_DEV_TRAVIS
export FRONTEND_URL=""
export BACKEND_PORT=5000
# POSTGRAPHQL_ENDPOINT defined in serverless.yml

# Postgres
export PGUSERNAME=example
export PGPASSWORD=serverless
# PGENDPOINT assigned in serverless.yml
