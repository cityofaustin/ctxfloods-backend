# AWS
export AWS_SERVICE_NAME=test2-ctx-floods-backend-dev-travis
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
