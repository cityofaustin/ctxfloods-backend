module.exports = () => {
  return `postgresql://floods_postgraphql:xyz@${process.env.PG_ENDPOINT}:5432/floods`
}
