var endpoint = `http://localhost:${process.env.BACKEND_PORT}/graphql`;

if (process.env.USE_AWS_ENDPOINT) {
  endpoint = process.env.GRAPHQL_ENDPOINT;
}

module.exports = {
  endpoint: endpoint,
};
