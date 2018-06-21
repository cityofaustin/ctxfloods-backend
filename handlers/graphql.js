const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

module.exports.getToken = async function getToken(email, password) {
  const anonLokka = new Lokka({ transport: new HttpTransport('http://localhost:5000/graphql') });

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
