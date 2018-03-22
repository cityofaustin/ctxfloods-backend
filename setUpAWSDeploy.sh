export CURRENT_FLOODS_BRANCH_NAME=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
export npm_config_PGCON=""
export npm_config_PGRUNCON=""

tput bold 
echo "Please enter your AWS Credentials"
tput sgr0

echo "Access key ID:"
read AWS_ACCESS_KEY_ID
export AWS_ACCESS_KEY_ID
travis encrypt AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID --add

echo "Secret access key"
read -s AWS_SECRET_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY
travis encrypt AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY --add

echo "Frontend URL for reset email links"
read FRONTEND_URL
export FRONTEND_URL

echo "Generating JWT secret"
export JWT_SECRET=$(openssl rand -base64 32)
travis encrypt JWT_SECRET=$JWT_SECRET --add

tput bold 
echo "Deploying to AWS to get a cloudformation/endpoint"
tput sgr0

yarn
sls deploy -v | tee out.tmp
export PGENDPOINT=$(grep "pgEndpoint" out.tmp | cut -f2- -d: | cut -c2-)
rm out.tmp

tput bold 
echo "Setting PGCON and PGRUNCON"
tput sgr0

export npm_config_PGCON=$(echo postgresql://example:serverless@$PGENDPOINT:5432/floods)
echo "  - npm_config_PGCON=$npm_config_PGCON" >> .travis.yml
export npm_config_PGRUNCON=$(echo postgresql://floods_postgraphql:xyz@$PGENDPOINT:5432/floods)
echo "  - npm_config_PGRUNCON=$npm_config_PGRUNCON" >> .travis.yml

tput bold 
echo "Deploying to AWS"
tput sgr0

yarn rebuild-and-deploy | tee out.tmp

export POSTGRAPHQL_ENDPOINT=$(grep "POST.*graphql" out.tmp | cut -f2- -d- | cut -c2-)
echo "  - POSTGRAPHQL_ENDPOINT=$POSTGRAPHQL_ENDPOINT" >> .travis.yml

rm out.tmp

echo "  - FRONTEND_URL=$FRONTEND_URL" >> .travis.yml
