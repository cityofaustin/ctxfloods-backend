// process.env.DEBUG="graphile-build:warn";
const awsServerlessExpress = require('aws-serverless-express');
const { postgraphile } = require('postgraphile');

const { logError } = require('../helpers/logger');
const floodsPool = require('../db/helpers/getClient')({
  clientType: 'floodsAPI',
  pool: true
});

// Following the pattern of https://github.com/graphile/postgraphile-lambda-example
const handler = (req, res) => {
  postgraphile(
    floodsPool,
    'floods',
    {
      jwtSecret: process.env.JWT_SECRET,
      jwtPgTypeIdentifier: 'floods.jwt_token',
      pgDefaultRole: 'floods_anonymous',
      disableDefaultMutations: true,
      cors: true,
      graphqlRoute: '/graphql',
      disableQueryLog: (process.env.DISABLE_QUERY_LOG && JSON.parse(process.env.DISABLE_QUERY_LOG)),
      readCache: `${__dirname}/../pgCatalog/postgraphile.cache`,
    }
  )(req, res, err => {
    console.log("Anything happening?")
    if (err) {
      logError(err);
      res.writeHead(err.status || err.statusCode || 500);
      res.setHeader("Access-Control-Allow-Origin", '*');
      res.end(err.message);
      return;
    }
  })
};

if (process.env.NODE_ENV === "local") {
  module.exports.handle = postgraphile(
    floodsPool,
    'floods',
    {
      jwtSecret: process.env.JWT_SECRET,
      jwtPgTypeIdentifier: 'floods.jwt_token',
      pgDefaultRole: 'floods_anonymous',
      disableDefaultMutations: true,
      cors: true,
      graphqlRoute: '/graphql',
      disableQueryLog: (process.env.DISABLE_QUERY_LOG && JSON.parse(process.env.DISABLE_QUERY_LOG)),
      readCache: `${__dirname}/../pgCatalog/postgraphile.cache`,
    }
  )
} else {
  const server = awsServerlessExpress.createServer(handler);
  module.exports.handle = (event, context) => awsServerlessExpress.proxy(server, event, context);
}
