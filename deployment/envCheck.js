const envCheck = () => {
  console.log("Hey lets look at all our varzzz");
  console.log(`AWS_SERVICE_NAME: ${process.env.AWS_SERVICE_NAME}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log(`GMAIL_ADDRESS: ${process.env.GMAIL_ADDRESS}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'nada'}`);
  console.log(`PGUSERNAME: ${process.env.PGUSERNAME}`);
  console.log(`PGPASSWORD: ${process.env.PGPASSWORD}`);
  console.log("And now the big one");
  console.log(`PGCON: ${process.env.PGCON}`);
  console.log(`ONLY_IN_SERVERLESS: ${process.env.ONLY_IN_SERVERLESS}`);
}

module.exports = envCheck;
