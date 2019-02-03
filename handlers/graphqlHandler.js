// process.env.DEBUG="graphile-build:warn";
const awsServerlessExpress = require('aws-serverless-express');
const { postgraphile } = require('postgraphile');

const { logError } = require('../helpers/logger');
const floodsPoolConfig = require('../db/helpers/getClient')({
  clientType: 'floodsAPI',
  pool: true,
  configOnly: true,
});

const postgraphileAPI = postgraphile(
  floodsPoolConfig,
  'floods',
  {
    jwtSecret: process.env.JWT_SECRET,
    jwtPgTypeIdentifier: 'floods.jwt_token',
    pgDefaultRole: 'floods_anonymous',
    disableDefaultMutations: true,
    cors: true,
    graphqlRoute: '/graphql',
    disableQueryLog: (process.env.DISABLE_QUERY_LOG && JSON.parse(process.env.DISABLE_QUERY_LOG)),
    readCache: `${__dirname}/../pgCatalog/postgraphile.cache`
  }
)

if (process.env.NODE_ENV === "local") {
  module.exports.handle = postgraphileAPI
} else {
  const server = awsServerlessExpress.createServer(postgraphileAPI);
  module.exports.handle = (event, context) => {
    return awsServerlessExpress.proxy(server, event, context);
  }
}
