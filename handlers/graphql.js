const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;
console.log("top of graphql.js");
require('../deployment/envCheck')();

async function getToken(email, password) {
  const anonLokka = new Lokka({
    transport: new HttpTransport('http://localhost:5000/graphql'),
  });

  const response = await anonLokka.send(
    `
    mutation($email:String!, $password:String!) {
      authenticate(input: {email: $email, password: $password}) {
        jwtToken
      }
    }
  `,
    {
      email: email,
      password: password,
    },
  );

  return response.authenticate.jwtToken;
}

async function getAuthorizedLokka(username, password) {
  const token = await getToken(username, password);
  const headers = {
    Authorization: 'Bearer ' + token,
  };
  const lokka = new Lokka({
    transport: new HttpTransport('http://localhost:5000/graphql', { headers }),
  });

  return lokka;
}

module.exports.getToken = getToken;
module.exports.getAuthorizedLokka = getAuthorizedLokka;
