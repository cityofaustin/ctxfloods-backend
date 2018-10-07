const Promise = require('bluebird');
Promise.config({
  longStackTraces: (process.env.AWS_STAGE === 'dev')
});
const pg = require('pg-promise')({
  promiseLib: Promise
});

module.exports = pg;
