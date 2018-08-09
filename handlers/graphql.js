const HttpTransport = require('lokka-transport-http').Transport;
const Lokka = require('lokka').Lokka;

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

async function getAnonLokka() {
  return new Lokka({
    transport: new HttpTransport('http://localhost:5000/graphql'),
  });
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

async function findUsersInCommunities(lokka, {communityIds}) {
  const response = await lokka.send(
    `
    query (
      $communityIds: [Int],
    ) {
      findUsersInCommunities(communityIds: $communityIds) {
        nodes {
          firstName
          lastName
          emailAddress
        }
      }
    }
  `,
    {communityIds},
  );

  return response.findUsersInCommunities.nodes;
}

module.exports.getToken = getToken;
module.exports.getAuthorizedLokka = getAuthorizedLokka;
module.exports.getAnonLokka = getAnonLokka;
