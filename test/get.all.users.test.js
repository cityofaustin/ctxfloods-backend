import { getSuperAdminLokka } from './helpers';

const communityOne = { communityId: 1 };
const communityTwo = { communityId: 2 };

describe('When getting users', () => {
  var superAdminLokka;
  beforeAll(async done => {
    superAdminLokka = await getSuperAdminLokka();
    done();
  });

  it('should get all users', async () => {
    const response = await superAdminLokka.send(
      `
      query($communityId:Int) {
        allUsers(condition: {communityId: $communityId}) {
          nodes {
            communityId
          }
        }
      }
    `,
      {},
    );

    expect(response.allUsers.nodes).toContainEqual(communityOne);
    expect(response.allUsers.nodes).toContainEqual(communityTwo);
  });

  it('should get only the users in a specified community', async done => {
    const response = await superAdminLokka.send(
      `
      query($communityId:Int) {
        allUsers(condition: {communityId: $communityId}) {
          nodes {
            communityId
          }
        }
      }
    `,
      {
        communityId: 2,
      },
    );

    expect(response.allUsers.nodes).not.toContainEqual(communityOne);
    expect(response.allUsers.nodes).toContainEqual(communityTwo);
    done();
  });
});
