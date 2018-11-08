// process.env.DEBUG="graphile-build:warn";
const {createPostGraphileSchema, withPostGraphileContext} = require("postgraphile");
const {graphql} = require('graphql');

const { logError } = require('./logger');
const floodsPool = require('../db/helpers/getPool')('floodsAPI');

const extractToken = (event) => {
  // lokka lowercases its headers
  let authHeader = (event.headers && (event.headers.authorization || event.headers.Authorization)) || null;
  let jwtToken = (authHeader ? authHeader.split("Bearer ")[1] : null);
  return jwtToken || null;
}

module.exports.handle = (event, context, cb) => {
  let schema;

  return createPostGraphileSchema(floodsPool, "floods", {
    pgDefaultRole: 'floods_anonymous',
    jwtSecret: process.env.JWT_SECRET,
    jwtPgTypeIdentifier: 'floods.jwt_token',
    pgDefaultRole: 'floods_anonymous',
    disableDefaultMutations: true,
    readCache: `${__dirname}/../pgCatalog/postgraphile.cache`
  })
  .then((result) => {
    schema = result;
    const jwtToken = extractToken(event);
    return withPostGraphileContext(
      {
        pgPool: floodsPool,
        jwtToken: jwtToken,
        jwtSecret: process.env.JWT_SECRET,
        pgDefaultRole: 'floods_anonymous'
      }, (graphileContext) => {
        return graphql(
          schema,
          event.query,
          null,
          graphileContext,
          event.variables,
          event.operationName
        )
      })
  })
  .then((response)=> {
    response.statusCode = 200;
    response.headers = { 'Access-Control-Allow-Origin': '*' };
    cb(null, response);
  })
  .catch((err)=>{
    logError(err);
    let response = {};
    response.statusCode = 500;
    response.headers = { 'Access-Control-Allow-Origin': '*' };
    response.errors = err;
    cb(null, response)
  })
}
