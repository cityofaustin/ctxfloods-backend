const Raven = require('raven');
const { SENTRY_DSN } = require('./constants');

if (process.env.NODE_ENV === 'production') {
  Raven.config(SENTRY_DSN).install();
}

module.exports.logErrorMessage = (message, err, options = {}) => {
  console.error(message, err);
  err.message = `${message} - ${err.message}`;
  Raven.captureException(err, options);
};

module.exports.logError = (err, options = {}) => {
  console.error(err);
  Raven.captureException(err, options);
};
