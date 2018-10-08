const Promise = require('bluebird');
Promise.config({
  longStackTraces: (process.env.AWS_STAGE === 'dev')
});
const pg = require('pg-promise')({
  promiseLib: Promise
});

process.on('SIGTERM', () => {
  console.log("Signal Terminated - closing pg");
  pg.end();
});

process.on('SIGINT', () => {
  console.log("Signal Interrupted - closing pg");
  pg.end();
});

module.exports = pg;
