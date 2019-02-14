import HttpTransport from 'lokka-transport-http';
import Lokka from 'lokka';
import uuidv4 from 'uuid';
import { endpoint } from './endpoints';
import jwt from 'jsonwebtoken';

import { getToken, anonLokka, getCommunityAdminLokka, getSuperAdminLokka } from './helpers';

describe('When registering, deactivating, and reactivating a user as a community admin', () => {
  var newUserEmail = uuidv4() + '@flo.ods';
  var newUserPassword = 'texasfloods';
  var newOtherCommunityUserEmail = uuidv4() + '@flo.ods';
  var newUserId;
  var newOtherCommunityUserId;

  var communityAdminLokka, superAdminLokka;
  beforeAll(async done => {
    communityAdminLokka = await getCommunityAdminLokka();
    superAdminLokka = await getSuperAdminLokka();
    done();
  })

  describe('As a community admin', async () => {

    it('should register a new user', async () => {
      const response = await communityAdminLokka.send(
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

  describe('As a super admin', async () => {
    it('should register a new other community user', async () => {
      const response = await superAdminLokka.send(
        `
        mutation($email:String!) {
          registerUser(input: {
            firstName: "New",
            lastName: "User",
            jobTitle: "Community Editor",
            communityId: 2,
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
          email: newOtherCommunityUserEmail,
        },
      );

      expect(response).not.toBeNull();
      expect(response.registerUser.user.active).toBeTruthy();
    });
  });

  describe('As the new user', async () => {
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
  });

  describe('As the new other community user', async () => {
    var newUserOtherCommunityLokka;
    beforeAll(async done => {
      getToken(newOtherCommunityUserEmail, newUserPassword).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        newUserOtherCommunityLokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should get the correct current user', async () => {
      const response = await newUserOtherCommunityLokka.send(`
        {
          currentUser {
            id
            firstName
          }
        }
      `);

      newOtherCommunityUserId = response.currentUser.id;
      expect(response.currentUser.firstName).toMatchSnapshot();
    });
  });

  describe('As a community admin again', async () => {
    it('should deactivate the user', async () => {
      const response = await communityAdminLokka.send(
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

    it('should fail to deactivate the other community user', async () => {
      try {
        const response = await communityAdminLokka.send(
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
            userID: newOtherCommunityUserId,
          },
        );
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });
  });

  it('should see the user is deactivated', async () => {
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

  describe('As the new other community user again', async () => {
    var newUserOtherCommunityLokka;
    beforeAll(async done => {
      getToken(newOtherCommunityUserEmail, newUserPassword).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        newUserOtherCommunityLokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should get the correct current user', async () => {
      const response = await newUserOtherCommunityLokka.send(`
        {
          currentUser {
            firstName
            lastName
          }
        }
      `);

      expect(response).toMatchSnapshot();
    });
  });

  it('should see the other community user is active', async () => {
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
        userId: newOtherCommunityUserId,
      },
    );

    expect(response).toMatchSnapshot();
  });

  describe('As a community admin once more', async () => {
    it('should reactivate the user', async () => {
      const response = await communityAdminLokka.send(
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
    var lokka;
    beforeAll(async done => {
      getToken(newUserEmail, newUserPassword).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        lokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should get the correct current user', async done => {
      const response = await lokka.send(`
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
