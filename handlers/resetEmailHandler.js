const nodemailer = require('nodemailer');
const Client = require('pg').Client;
const jwt = require('jsonwebtoken');

const { sendEmail } = require('./emailer');

async function sendResetEmail(firstname, lastname, email, token, cb) {
  try {
    await sendEmail({
      from: 'CTXfloods <ctxfloodstestmailer@gmail.com>',
      to: `${firstname} ${lastname} <${email}>`,
      subject: 'Reset CTXfloods Password',
      text: `CTXfloods password reset url: http://${
        process.env.FRONTEND_URL
      }/dashboard/reset_password/${token}`,
      html: `<p>Click <a href="http://${
        process.env.FRONTEND_URL
      }/dashboard/reset_password/${token}">here</a> to reset your CTXfloods password.</p>`,
    });

    const response = {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Origin': '*' },
    };

    cb(null, response);
  } catch (err) {
    console.log('Error occurred. ' + err.message);
    return process.exit(1);
  }
}

module.exports.handle = (event, context, cb) => {
  const pgClient = new Client(process.env.PGCON);
  const { email } = JSON.parse(event.body);

  pgClient.connect();

  pgClient
    .query(
      'select id, last_name, first_name from floods.user where email_address = $1::text',
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
      const token = jwt.sign(
        { user_id: pgres.rows[0].id, role: 'floods_password_resetter' },
        process.env.JWT_SECRET,
        { expiresIn: '30m', audience: 'postgraphql' },
      );

      return sendResetEmail(firstname, lastname, email, token, cb);
    })
    .catch(err => console.log({ errors: [err] }))
    .then(() => pgClient.end());
};
