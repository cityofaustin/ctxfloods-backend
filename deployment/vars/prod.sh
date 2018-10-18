# AWS
export AWS_SERVICE_NAME=ctxfloods-backend-prod
export AWS_ACCESS_KEY_ID=$TRAVIS_ACCESS_KEY_ID_DEV
export AWS_SECRET_ACCESS_KEY=$TRAVIS_SECRET_ACCESS_KEY_DEV
export AWS_STAGE=prod # TODO - check if "prod"" triggers anything different

# Gmail
export GMAIL_ADDRESS=$TRAVIS_GMAIL_ADDRESS_DEV
export GMAIL_PASSWORD=$TRAVIS_GMAIL_PASSWORD_DEV

# App
export JWT_SECRET=$TRAVIS_JWT_SECRET_DEV
export FRONTEND_URL=""
export BACKEND_PORT=5000
# ENABLE_SYNC_LEGACY disabled. Interpretted as truthy by serverless.yml when any string is passed.
# GRAPHQL_ENDPOINT defined in serverless.yml

# Postgres
export PGUSERNAME=$TRAVIS_PGUSERNAME_DEV
export PGPASSWORD=$TRAVIS_PGPASSWORD_DEV
# PGENDPOINT assigned in serverless.yml
