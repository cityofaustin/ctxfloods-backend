# AWS
export AWS_SERVICE_NAME=ctxfloods-backend-prod
export AWS_DB_INSTANCE_IDENTIFIER=ctxfloods-prod
export AWS_ACCESS_KEY_ID=$TRAVIS_ACCESS_KEY_ID_DEV
export AWS_SECRET_ACCESS_KEY=$TRAVIS_SECRET_ACCESS_KEY_DEV
export AWS_STAGE=prod # TODO - check if "prod"" triggers anything different

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
# ENABLE_PUSH_NOTIFICATIONS disabled. Interpretted as truthy by serverless.yml when any string is passed.
export AUSTIN_DATA_APP_TOKEN=$TRAVIS_AUSTIN_DATA_APP_TOKEN_DEV

# Postgres
export PG_MASTER_USR=$TRAVIS_PG_MASTER_USR_PROD
export PG_MASTER_PW=$TRAVIS_PG_MASTER_PW_PROD
export PG_API_USR=floods_graphql
export PG_API_PW=$TRAVIS_PG_API_PW_PROD
# PG_ENDPOINT assigned in serverless.yml
