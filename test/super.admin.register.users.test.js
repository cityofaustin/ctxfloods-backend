import HttpTransport from 'lokka-transport-http';
import Lokka from 'lokka';
import uuidv4 from 'uuid';
import { endpoint } from './endpoints';

import { getToken, anonLokka, getSuperAdminLokka } from './helpers';

describe('When registering a super admin', () => {
  var newUserEmail = uuidv4() + '@flo.ods';
  var newUserPassword = 'texasfloods';
  var newUserId;

  var superAdminLokka;
  beforeAll(async done => {
    superAdminLokka = await getSuperAdminLokka();
    done();
  })

  describe('As a super admin', async () => {
    it('should register a new super admin', async () => {
      const response = await superAdminLokka.send(
        `
        mutation($email:String!) {
          registerUser(input: {
            firstName: "New",
            lastName: "User",
            jobTitle: "Super Admin",
            communityId: 1,
            phoneNumber: "555-6666",
            email: $email,
            password:"texasfloods",
            role:"floods_super_admin"
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

  it('the new user should show up in the DB', async () => {
    const response = await superAdminLokka.send(
      `
      query ($id: Int!) {
        userById(id: $id) {
          firstName
          lastName
          jobTitle
        }
      }
    `,
      {
        id: newUserId,
      },
    );

    expect(response).toMatchSnapshot();
  });

  describe('As the new super admin', async () => {
    var newSuperAdmin;
    beforeEach(async done => {
      getToken(newUserEmail, newUserPassword).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        newSuperAdmin = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should get the correct current user', async () => {
      const response = await newSuperAdmin.send(`
        {
          currentUser {
            firstName
            lastName
            jobTitle
          }
        }
      `);

      expect(response).toMatchSnapshot();
    });
  });
});

describe('When registering a community admin', () => {
  var newUserEmail = uuidv4() + '@flo.ods';
  var newUserPassword = 'texasfloods';
  var newUserId;

  var superAdminLokka;
  beforeAll(async done => {
    superAdminLokka = await getSuperAdminLokka();
    done();
  })

  describe('As a super admin', async () => {
    it('should register a new community admin', async () => {
      const response = await superAdminLokka.send(
        `
        mutation($email:String!) {
          registerUser(input: {
            firstName: "New",
            lastName: "User",
            jobTitle: "Community Admin",
            communityId: 1,
            phoneNumber: "555-6666",
            email: $email,
            password:"texasfloods",
            role:"floods_community_admin"
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

  it('the new user should show up in the DB', async () => {
    const response = await superAdminLokka.send(
      `
      query ($id: Int!) {
        userById(id: $id) {
          firstName
          lastName
          jobTitle
        }
      }
    `,
      {
        id: newUserId,
      },
    );

    expect(response).toMatchSnapshot();
  });

  describe('As the new community admin', async () => {
    var newCommunityAdminLokka;

    beforeEach(async done => {
      getToken(newUserEmail, newUserPassword).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        newCommunityAdminLokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should get the correct current user', async () => {
      const response = await newCommunityAdminLokka.send(`
        {
          currentUser {
            firstName
            lastName
            jobTitle
          }
        }
      `);

      expect(response).toMatchSnapshot();
    });
  });
});

describe('When registering a community editor', () => {
  var newUserEmail = uuidv4() + '@flo.ods';
  var newUserPassword = 'texasfloods';
  var newUserId;

  var superAdminLokka;
  beforeAll(async done => {
    superAdminLokka = await getSuperAdminLokka();
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

  it('the new user should show up in the DB', async () => {
    const response = await superAdminLokka.send(
      `
      query ($id: Int!) {
        userById(id: $id) {
          firstName
          lastName
          jobTitle
        }
      }
    `,
      {
        id: newUserId,
      },
    );

    expect(response).toMatchSnapshot();
  });

  describe('As the new community editor', async () => {
    var newCommunityAdminLokka;

    beforeAll(async done => {
      getToken(newUserEmail, newUserPassword).then(token => {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        newCommunityAdminLokka = new Lokka({
          transport: new HttpTransport(endpoint, { headers }),
        });
        done();
      });
    });

    it('should get the correct current user', async done => {
      const response = await newCommunityAdminLokka.send(`
        {
          currentUser {
            firstName
            lastName
            jobTitle
          }
        }
      `);

      expect(response).toMatchSnapshot();
      done();
    });
  });
});
