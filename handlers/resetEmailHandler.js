require('promise.prototype.finally').shim();
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { sendEmail } = require('../helpers/emailer');
const { logError } = require('../helpers/logger');
const getClient = require('../db/helpers/getClient');

const newUserSubject = 'Welcome to CTXfloods!';

const newUserTextTemplate = _.template(`
Welcome to CTXfloods! Please click here <%- frontendURL %>/dashboard/reset_password?resetterJwt=<%- resetterJwt %>&email=<%- email %> to set your password.
`);

const newUserHtmlTemplate = _.template(`
<p>Welcome to CTXfloods! Please <a href="<%- frontendURL %>/dashboard/reset_password?resetterJwt=<%- resetterJwt %>&email=<%- email %>" target="_blank">click here</a> to set your password.</p>
`);

const resetPasswordSubject = 'Reset CTXfloods Password';

const resetPasswordTextTemplate = _.template(`
Please click here <%- frontendURL %>/dashboard/reset_password?resetterJwt=<%- resetterJwt %>&email=<%- email %> to reset your password.
`);

const resetPasswordHtmlTemplate = _.template(`
<p>Please <a href="<%- frontendURL %>/dashboard/reset_password?resetterJwt=<%- resetterJwt %>&email=<%- email %>" target="_blank">click here</a> to reset your password.</p>
`);

async function sendResetEmail(firstname, lastname, email, resetterJwt, frontendURL, newUser, cb) {
  let subject, text, html;
  if (newUser) {
    subject = newUserSubject;
    text = newUserTextTemplate({frontendURL, resetterJwt, email});
    html = newUserHtmlTemplate({frontendURL, resetterJwt, email});
  } else {
    subject = resetPasswordSubject;
    text = resetPasswordTextTemplate({frontendURL, resetterJwt, email});
    html = resetPasswordHtmlTemplate({frontendURL, resetterJwt, email});
  }

  try {
    await sendEmail({
      from: 'CTXfloods <ctxfloodstestmailer@gmail.com>',
      to: `${firstname} ${lastname} <${email}>`,
      subject,
      text,
      html,
    });

    const response = {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Origin': '*' },
    };

    cb(null, response);
  } catch (err) {
    logError(err);
    const response = {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: {
        errorMessage: err.message
      }
    };
    cb(null, response);
  }
}

module.exports.handle = (event, context, cb) => {
  const pgClient = getClient({clientType: "floodsAPI"});
  const { email, newUser } = JSON.parse(event.body);
  // New user jwt token should expire in 1 week, other jwts should expire in 30 minutes.
  const expiration = (newUser) ? '7d' : '30m';
  const frontendURL = event.headers.origin;

  pgClient.connect();
  return pgClient
    .query(
      'select id, last_name, first_name from floods.user where email_address = $1::text and active = true',
      [email],
    )
    .then(pgres => {
      if (!pgres.rowCount) {
        const response = {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          },
          body: `Could not find user account for email: ${email}`,
        };

        cb(null, response);
        return;
      }

      const firstname = pgres.rows[0].first_name;
      const lastname = pgres.rows[0].last_name;
      const resetterJwt = jwt.sign(
        { user_id: pgres.rows[0].id, role: 'floods_password_resetter' },
        process.env.JWT_SECRET,
        { expiresIn: expiration, audience: 'postgraphile' },
      );

      return sendResetEmail(firstname, lastname, email, resetterJwt, frontendURL, newUser, cb);
    })
    .catch(err => {
      logError(err)
      const response = {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: `Bad Request`,
      };

      cb(null, response);
      return;
    })
    .finally(() => pgClient.end());
};
