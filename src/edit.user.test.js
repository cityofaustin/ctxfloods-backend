import HttpTransport from 'lokka-transport-http';
import Lokka from 'lokka';
import uuidv4 from 'uuid';
import { endpoint } from './endpoints';

const anonLokka = new Lokka({ transport: new HttpTransport(endpoint) });

const editUserMutation = `
  mutation($userId:Int!,
           $lastName:String!,
           $firstName:String!,
           $jobTitle:String!,
           $phoneNumber:String!) 
  {
    editUser(input: { userId: $userId,
                      lastName: $lastName,
                      firstName: $firstName,
                      jobTitle: $jobTitle,
                      phoneNumber: $phoneNumber })
    {
      user {
        lastName
        firstName
        jobTitle
        phoneNumber
      }
    }
  }
`;

async function getToken(email, password) {
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

function shouldWork(email, password, newUserEmail, newUserRole, extra_description) {
  var newUserId;

  describe('as a super admin', () => {
    var lokka;

    beforeAll(async done => {
      getToken('superadmin@flo.ods', 'texasfloods').then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        lokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should add a new user', async () => {
      const response = await lokka.send(
        `
        mutation($role:String!, $email:String!) {
          registerUser(input: {
            firstName: "New",
            lastName: "New",
            jobTitle: "New",
            communityId: 1,
            phoneNumber: "New",
            email: $email,
            password:"texasfloods",
            role:$role
          }) {
            user {
              id
            }
          }
        }
      `,
      {
        role: newUserRole,
        email: newUserEmail,
      },
      );

      newUserId = response.registerUser.user.id;
      expect(response).not.toBeNull();
    });
  })

  describe('as ' + email + ' ' + (extra_description || ''), () => {
    var lokka;

    beforeAll(async done => {
      getToken(email, password).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        lokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should edit the user', async () => {
      const response = await lokka.send(editUserMutation, {
        userId: newUserId,
        lastName: "Edited",
        firstName: "Edited",
        jobTitle: "Edited",
        phoneNumber: "Edited"
      });

      expect(response).toMatchSnapshot();
    });
  });
}

function shouldFail(email, password, newUserEmail, newUserRole, extra_description) {
  var newUserId;

  describe('as a super admin', () => {
    var lokka;

    beforeAll(async done => {
      getToken('superadmin@flo.ods', 'texasfloods').then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        lokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should add a new user', async () => {
      const response = await lokka.send(
        `
        mutation($role:String!, $email:String!) {
          registerUser(input: {
            firstName: "New",
            lastName: "New",
            jobTitle: "New",
            communityId: 1,
            phoneNumber: "New",
            email: $email,
            password:"texasfloods",
            role:$role
          }) {
            user {
              id
            }
          }
        }
      `,
      {
        role: newUserRole,
        email: newUserEmail,
      },
      );

      newUserId = response.registerUser.user.id;
      expect(response).not.toBeNull();
    });
  })

  describe('as ' + email + ' ' + (extra_description || ''), () => {
    var lokka;

    beforeAll(async done => {
      getToken(email, password).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        lokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should fail to edit the user', async () => {
      try {
        const response = await lokka.send(editUserMutation, {
          userId: newUserId,
          lastName: "Edited",
          firstName: "Edited",
          jobTitle: "Edited",
          phoneNumber: "Edited"
        });
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });
  });
}

describe('When editing a user', () => { 

  shouldWork('superadmin@flo.ods', 'texasfloods', `${uuidv4()}@flo.ods`, 'floods_super_admin', 'editing a super admin');
  shouldFail('editor@community.floods', 'texasfloods', `${uuidv4()}@flo.ods`, 'floods_super_admin', 'editing a super admin');

});
