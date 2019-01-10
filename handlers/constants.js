module.exports.SENTRY_DSN =
  'https://2627dd87d0fd4249a65d160aef644f88@sentry.io/1191657';

// Only used in pushNotificationHandler, which is a cron job that does not receive a request from a frontend.
// Otherwise, it's more accurate to use event.headers.origin to get frontendURL
let frontendURL;
if (process.env.AWS_SERVICE_NAME === 'ctxfloods-backend-prod-legacy-sync') {
  frontendURL = 'floods.austintexas.io';
} else if (process.env.AWS_SERVICE_NAME === 'ctxfloods-backend-prod') {
  frontendURL = 'floodstest.austintexas.io';
} else if (!process.env.AWS_SERVICE_NAME) {
  frontendURL = 'localhost:3000';
} else {
  // Assume the deployed dev branches will point to a corresponding frontend with the same branch name
  frontendURL = `${process.env.AWS_SERVICE_NAME.replace('ctxfloods-backend','ctxfloods-frontend')}.s3-website-us-east-1.amazonaws.com`
}
module.exports.frontendURL = frontendURL;
