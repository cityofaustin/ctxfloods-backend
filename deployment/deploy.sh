yarn global add serverless@1.32.0
yarn
sls deploy -v | tee out.tmp
# MIGRATE_ENDPOINT=$(grep "POST.*migrate" out.tmp | cut -f2- -d- | cut -c2-)
rm out.tmp
# curl MIGRATE_ENDPOINT
