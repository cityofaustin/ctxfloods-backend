var endpoint = `http://localhost:${process.env.BACKEND_PORT}/graphql`;

if (process.env.USE_AWS_ENDPOINT) {
  endpoint = process.env.POSTGRAPHQL_ENDPOINT;
}

module.exports = {
  endpoint: endpoint,
};
