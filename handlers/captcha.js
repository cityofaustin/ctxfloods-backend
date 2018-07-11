const GoogleRecaptcha = require('google-recaptcha');

const { logError } = require('./logger');

const googleRecaptcha =
  process.env.RECAPTCHA_SECRET_KEY &&
  new GoogleRecaptcha({
    secret: process.env.RECAPTCHA_SECRET_KEY,
  });

module.exports.verifyCaptcha = function verifyCaptcha(recaptchaResponse) {
  return new Promise((resolve, reject) => {
    if (!googleRecaptcha) {
      return resolve();
    }
    googleRecaptcha.verify({ response: recaptchaResponse }, err => {
      if (err) {
        logError(err);
        return reject(err);
      }
      return resolve();
    });
  });
};
