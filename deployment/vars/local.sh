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
export JWT_SECRET=insecure
export BACKEND_PORT=5000
# ENABLE_SYNC_LEGACY not required for local testing
export GRAPHQL_ENDPOINT=http://localhost:$BACKEND_PORT/graphql
# ENABLE_PUSH_NOTIFICATIONS not required for local testing
# AUSTIN_DATA_APP_TOKEN not required locally. Don't worry about requests getting throttled.

# Postgres
export PGUSERNAME=postgres
export PGPASSWORD=password
export PGENDPOINT=localhost
