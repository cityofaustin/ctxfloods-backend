module.exports = () => {
  if (process.env.PGCON) {
    return process.env.PGCON; // For local testing
  } else {
    return `postgresql://floods_postgraphql:xyz@${process.env.PG_ENDPOINT}:5432/floods`;
  }
}
