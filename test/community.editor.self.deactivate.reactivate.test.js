import HttpTransport from 'lokka-transport-http';
import Lokka from 'lokka';
import uuidv4 from 'uuid';
import jwt from 'jsonwebtoken';
import { endpoint } from './endpoints';

import { getToken, anonLokka, getCommunityEditorLokka, getSuperAdminLokka } from './helpers';

describe('When registering, deactivating, and reactivating a user', () => {
  var newUserEmail = uuidv4() + '@flo.ods';
  var newUserPassword = 'texasfloods';
  var newUserId;

  var superAdminLokka, communityEditorLokka;
  beforeAll(async done => {
    superAdminLokka = await getSuperAdminLokka();
    communityEditorLokka = await getCommunityEditorLokka();
    done();
  })

  describe('As a super admin', async () => {
    it('should register a new user', async () => {
      const response = await superAdminLokka.send(
        `
        mutation($email:String!) {
          registerUser(input: {
            firstName: "New",
            lastName: "User",
            jobTitle: "Community Editor",
            communityId: 1,
            phoneNumber: "555-6666",
            email: $email,
            password:"texasfloods",
            role:"floods_community_editor"
          }) {
            user {
              id
              active
            }
          }
        }
      `,
        {
          email: newUserEmail,
        },
      );

      expect(response).not.toBeNull();
      expect(response.registerUser.user.active).toBeTruthy();
    });
  });

  describe('As the new user', async () => {
    var newUserLokka;

    beforeEach(async done => {
      getToken(newUserEmail, newUserPassword).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        newUserLokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should get the correct current user', async () => {
      const response = await newUserLokka.send(`
        {
          currentUser {
            id
            firstName
          }
        }
      `);

      newUserId = response.currentUser.id;
      expect(response.currentUser.firstName).toMatchSnapshot();
    });

    it('should see the user in the database', async () => {
      const response = await superAdminLokka.send(
        `
        query($userId:Int!){
          userById(id:$userId) {
            firstName
            lastName
            active
          }
        }
      `,
        {
          userId: newUserId,
        },
      );

      expect(response).toMatchSnapshot();
    });

    it('should deactivate itself', async () => {
      const response = await newUserLokka.send(
        `
        mutation($userID:Int!) {
          deactivateUser(input: {userId: $userID}) {
            user {
              id
            }
          }
        }
      `,
        {
          userID: newUserId,
        },
      );

      expect(response).not.toBeNull();
    });
  });

  describe('As a super admin again', async () => {
    it('should reactivate the user', async () => {
      const response = await superAdminLokka.send(
        `
        mutation($userId:Int!) {
          reactivateUser(input: {
            userId: $userId
          }) {
            user {
              firstName
              lastName
              active
            }
          }
        }
      `,
        {
          userId: newUserId,
        },
      );

      expect(response).toMatchSnapshot();
    });
  });

  describe('As a password resetter', async () => {
    var passwordResetterLokka;

    beforeAll(async done => {
      const token = jwt.sign({ user_id: newUserId, role: 'floods_password_resetter' }, process.env.JWT_SECRET, {expiresIn: '30m', audience: 'postgraphile'});
      const headers = {
        Authorization: 'Bearer ' + token,
      };
      passwordResetterLokka = new Lokka({
        transport: new HttpTransport(endpoint, { headers }),
      });
      done();
    })


    it('should reset the password', async () => {
      const response = await passwordResetterLokka.send(
        `
        mutation ($password:String!){
          resetPassword(input: {
            newPassword: $password
          }) {
            jwtToken
          }
        }
      `,
        {
          password: newUserPassword,
        },
      );

      expect(response.jwtToken).not.toBeNull();
    });
  });

  describe('As the reactivated user', async () => {
    var newUserLokka;

    beforeAll(async done => {
      getToken(newUserEmail, newUserPassword).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        newUserLokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should get the correct current user', async done => {
      const response = await newUserLokka.send(`
        {
          currentUser {
            firstName
            lastName
          }
        }
      `);

      expect(response).toMatchSnapshot();
      done();
    });
  });
});
