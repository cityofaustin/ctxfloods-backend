# AWS
export AWS_STAGE='dev'
# Others not required for local testing

# Gmail
# [Local Only] Add a address/password combination to your own bash_profile if you want your local instance to send emails.
export GMAIL_ADDRESS=$CTXFLOODS_GMAIL_ADDRESS
export GMAIL_PASSWORD=$CTXFLOODS_GMAIL_PASSWORD
# Or, you can add your own OAuth2 credentials
export GMAIL_CLIENT_ID=$CTXFLOODS_GMAIL_CLIENT_ID
export GMAIL_CLIENT_SECRET=$CTXFLOODS_GMAIL_CLIENT_SECRET
export GMAIL_REFRESH_TOKEN=$CTXFLOODS_GMAIL_REFRESH_TOKEN
# Or, don't do anything. An etheral test email will be mocked.

# App
export NODE_ENV=local
export JWT_SECRET=insecure
export BACKEND_PORT=5000
# ENABLE_SYNC_LEGACY not required for local testing
export GRAPHQL_ENDPOINT=http://localhost:$BACKEND_PORT/graphql
# ENABLE_PUSH_NOTIFICATIONS not required for local testing
# AUSTIN_DATA_APP_TOKEN not required locally. Don't worry about requests getting throttled.
export GRAPHQL_API_USR=graphql@flo.ods
export GRAPHQL_API_PW=floods_graphql
export DISABLE_QUERY_LOG=false

# Postgres
# [Local Only] Plug in your own Postgres Credential environment variables into your .bash_profile
export PG_PORT=5432
export PG_MASTER_USR=$CTXFLOODS_PG_MASTER_USR
export PG_MASTER_PW=$CTXFLOODS_PG_MASTER_PW
export PG_API_USR=floods_graphql
export PG_API_PW=floods_graphql
export PG_SUPER_ADMIN_PW=texasfloods # only used during initialization
export PG_ENDPOINT=localhost
# DB_DELETION_PROTECTION not required locally
# DB_BACKUP_RETENTION_PERIOD not required locally

# Travis postgres v10 requires special configs
if [[ $TRAVIS = true ]];then
  export PG_PORT=5432
  export PG_MASTER_USR=postgres
  export PG_MASTER_PW=""
fi
