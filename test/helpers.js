import HttpTransport from 'lokka-transport-http';
import Lokka from 'lokka';
import { endpoint } from './endpoints';

const superAdminEmail = 'superadmin@flo.ods';
const communityAdminEmail = 'admin@community.floods';
const communityEditorEmail = 'editor@community.floods';
const superAdminPassword = 'texasfloods';

export const anonLokka = new Lokka({ transport: new HttpTransport(endpoint) });

export async function getToken(email, password) {
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

export async function getCommunityAdminLokka(){
  return getToken(communityAdminEmail, superAdminPassword).then(token => {
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    var communityAdminLokka = new Lokka({
      transport: new HttpTransport(endpoint, { headers }),
    });
    return communityAdminLokka
  });
}

export async function getCommunityEditorLokka(){
  return getToken(communityEditorEmail, superAdminPassword).then(token => {
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    var communityEditorLokka = new Lokka({
      transport: new HttpTransport(endpoint, { headers }),
    });
    return communityEditorLokka;
  });
}

export async function getSuperAdminLokka(){
  return getToken(superAdminEmail, superAdminPassword).then(token => {
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    var superAdminLokka = new Lokka({
      transport: new HttpTransport(endpoint, { headers }),
    });
    return superAdminLokka
  });
}
