# AWS
export AWS_SERVICE_NAME=ctxfloods-backend-prod-legacy-sync
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
export ENABLE_SYNC_LEGACY=true # Interpretted as truthy by serverless.yml when any string is passed.
# GRAPHQL_ENDPOINT defined in serverless.yml
# ENABLE_PUSH_NOTIFICATIONS disabled. Interpretted as truthy by serverless.yml when any string is passed.

# Postgres
export PGUSERNAME=$TRAVIS_PGUSERNAME_DEV
export PGPASSWORD=$TRAVIS_PGPASSWORD_DEV
# PGENDPOINT assigned in serverless.yml
