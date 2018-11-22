const nodemailer = require('nodemailer');

async function getTransporter() {
  if (process.env.GMAIL_CLIENT_ID) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_ADDRESS,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  } else if (process.env.GMAIL_ADDRESS) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_ADDRESS,
          pass: process.env.GMAIL_PASSWORD,
        },
      })
  } else {
    // If we don't have gmail credentials, send an ethereal test email
    // Generate SMTP service account from ethereal.email
    const account = await nodemailer.createTestAccount();
    console.log('Ethereal email credentials obtained, sending message...');

    return nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }
}

async function sendEmail({ from, to, subject, text, html }) {
  try {
    const message = arguments[0];

    const transporter = await getTransporter();
    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);

    // Preview only available when sending through an Ethereal account
    const previewURL = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL: %s', previewURL);
  } catch (err) {
    console.error('Error occurred. ' + err.message);
    throw err;
  }
}

module.exports = {
  getTransporter,
  sendEmail,
};
