const envCheck = () => {
  console.log("Hey lets look at all our varzzz");
  console.log(`AWS_SERVICE_NAME: ${AWS_SERVICE_NAME}`);
  console.log(`FRONTEND_URL: ${FRONTEND_URL}`);
  console.log(`GMAIL_ADDRESS: ${GMAIL_ADDRESS}`);
  console.log(`JWT_SECRET: ${JWT_SECRET.length}`);
  console.log(`PGUSERNAME: ${PGUSERNAME}`);
  console.log(`PGPASSWORD: ${PGPASSWORD}`);
  console.log("And now the big one");
  console.log(`PGCON: ${PGCON}`);
}

module.exports = envCheck;
