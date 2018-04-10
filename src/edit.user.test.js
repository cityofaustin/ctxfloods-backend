import HttpTransport from 'lokka-transport-http';
import Lokka from 'lokka';
import { endpoint } from './endpoints';

const anonLokka = new Lokka({ transport: new HttpTransport(endpoint) });
const everyPassword = 'texasfloods';

var newSuperAdminId;
var newCommunityAdminId;
var newCommunityEditorId;

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

function shouldWork(email, password, userId, lastName, firstName, jobTitle, phoneNumber, extra_description) {
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
        userId: userId,
        lastName: lastName,
        firstName: firstName,
        jobTitle: jobTitle,
        phoneNumber: phoneNumber
      });

      expect(response).toMatchSnapshot();
    });
  });
}

function shouldFail(email, password, userId, lastName, firstName, jobTitle, phoneNumber, extra_description) {
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

    // TESTS THAT SHOULD FAIL GO HERE
  });
}

describe('When editing a user', () => {
  var lokka;

  beforeAll(async done => {
    getToken("superadmin@flo.ods", everyPassword).then(token => {
      const headers = {
        Authorization: 'Bearer ' + token,
      };
      lokka = new Lokka({
        transport: new HttpTransport(endpoint, { headers }),
      });
      done();
    });
  });

  it('should add a new super admin', async () => {
    const response = await lokka.send(
      `
      mutation {
        registerUser(input: {
          firstName: "New",
          lastName: "New",
          jobTitle: "New",
          communityId: 1,
          phoneNumber: "New",
          email: "new@super.admin",
          password:"texasfloods",
          role:"floods_super_admin"
        }) {
          user {
            id
          }
        }
      }
    `
    );


    newSuperAdminId = response.registerUser.user.id;
    expect(response).not.toBeNull();
  });

  it('should add a new community admin', async () => {
    const response = await lokka.send(
      `
      mutation {
        registerUser(input: {
          firstName: "New",
          lastName: "New",
          jobTitle: "New",
          communityId: 1,
          phoneNumber: "New",
          email: "new@community.admin",
          password:"texasfloods",
          role:"floods_community_admin"
        }) {
          user {
            id
          }
        }
      }
    `
    );


    newCommunityAdminId = response.registerUser.user.id;
    expect(response).not.toBeNull();
  });

  it('should add a new community editor', async () => {
    const response = await lokka.send(
      `
      mutation {
        registerUser(input: {
          firstName: "New",
          lastName: "New",
          jobTitle: "New",
          communityId: 1,
          phoneNumber: "New",
          email: "new@community.editor",
          password:"texasfloods",
          role:"floods_community_editor"
        }) {
          user {
            id
          }
        }
      }
    `
    );


    newCommunityEditorId = response.registerUser.user.id;
    expect(response).not.toBeNull();
  });

  shouldWork("superadmin@flo.ods", everyPassword, newSuperAdminId, "1", "1", "1", "1", "editing a super admin");
  shouldWork("superadmin@flo.ods", everyPassword, newCommunityAdminId, "1", "1", "1", "1", "editing a community admin");
  shouldWork("superadmin@flo.ods", everyPassword, newCommunityEditorId, "1", "1", "1", "1", "editing a community editor");
});
