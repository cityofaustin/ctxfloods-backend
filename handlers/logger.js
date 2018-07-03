import Raven from 'raven';

export function logErrorMessage(message, err, options = {}) {
  console.error(message, err);
  err.message = `${message} - ${err.message}`;
  Raven.captureException(err, options);
}

export function logError(err, options = {}) {
  console.error(err);
  Raven.captureException(err, options);
}
