/**
  Wrapper function that builds and safely destroys a db connection for a node postgres script.
  @param: cb, Function - a node pg script that requires a db connection
  @param: db, Database Class - output of createCon(), a Database Class instance that can create a connection
**/
module.exports = (cb, db) => {
  let conn, errFlag = false;
  return db.connect({direct: true})
  .then((result) => {
    conn = result;
    return cb(conn);
  })
  .catch((err)=>{
    console.log("oh noo", err);
    errFlag = true;
    process.exit(1);
  })
  .finally(() => {
    if (conn) conn.done();
  })
  .then(() => {
    if (errFlag) process.exit(1); //Must exit with error for propagate to TravisCI
  })
}
