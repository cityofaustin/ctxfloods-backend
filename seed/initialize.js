const db = require('../db/cons/initial');

const floodsExists = () => {
  let saved_conn;
  db.connect({direct: true})
  .then((conn) => {
    saved_conn = conn;
    console.log("saved_conn", saved_conn)
    return conn.query(`select 1 as result from pg_database where datname='floods'`)
  })
  .then((data) => {
    const result = (data[0].result === 1);
    console.log("we got something!", data, result);
    return Promise.resolve(result);
  })
  .finally((data) => {
    console.log('but bluebird works at least', data)
    saved_conn.done()
    return data
  })
}

floodsExists();
