import HttpTransport from 'lokka-transport-http';
import Lokka from 'lokka';
import uuidv4 from 'uuid';
import { endpoint } from './endpoints';

import { getToken, anonLokka, getCommunityEditorLokka, getSuperAdminLokka } from './helpers';

describe('When deactivating, and reactivating a user as a community editor', () => {
  var newUserEmail = uuidv4() + '@flo.ods';
  var newUserId;

  var superAdminLokka, communityEditorLokka;
  beforeAll(async done => {
    superAdminLokka = await getSuperAdminLokka();
    communityEditorLokka = await getCommunityEditorLokka();
    done();
  })

  describe('As a super admin', async () => {
    it('should register a new community editor', async () => {
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
            }
          }
        }
      `,
        {
          email: newUserEmail,
        },
      );

      newUserId = response.registerUser.user.id;
      expect(response).not.toBeNull();
    });
  });

  describe('As a community editor', async () => {
    it('should fail to deactivate the new community editor', async () => {
      try {
        const response = await communityEditorLokka.send(
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
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });
  });

  describe('As a super admin again', async () => {
    it('should deactivate the user', async () => {
      const response = await superAdminLokka.send(
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

  describe('As a community editor again', async () => {
    it('should fail to reactivate the new community editor', async done => {
      try {
        const response = await communityEditorLokka.send(
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
            userId: newUserId
          },
        );
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
      done()
    });
  });
});
