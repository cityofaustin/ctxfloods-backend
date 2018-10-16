/**
Check if "floods" database exists on target Postgres connection
@returns: Boolean, true if "floods" exist, false if not
**/
const floodsExists = (conn) => {
  return conn.query(`select 1 as result from pg_database where datname='floods'`)
  .then((result) => {
    if (result.rowCount === 0) {
      return false
    } else {
      return result.rows[0].result === 1
    }
  })
}

module.exports = floodsExists;
