# AWS
export AWS_STAGE='dev'
# Others not required for local testing

# Gmail
# Not required for local testing

# App
export JWT_SECRET=insecure
export BACKEND_PORT=5000
# ENABLE_SYNC_LEGACY not required for local testing
export GRAPHQL_ENDPOINT=http://localhost:$BACKEND_PORT/graphql

# Postgres
export PGUSERNAME=postgres
export PGPASSWORD=password
export PGENDPOINT=localhost
