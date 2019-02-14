import { anonLokka, getCommunityAdminLokka, getCommunityEditorLokka, getSuperAdminLokka } from './helpers';

async function shouldWork(lokka, extra_description) {
  describe('as ' + extra_description, () => {
    it('should get everything', async (done) => {
      const response = await anonLokka.send(`
        {
          allCommunities {
            nodes {
              id
            }
          }
          allStatuses {
            nodes {
              id
            }
          }
          allStatusUpdates {
            nodes {
              id
            }
          }
          allStatusReasons {
            nodes {
              id
            }
          }
          allStatusAssociations {
            nodes {
              id
            }
          }
          allCrossings {
            nodes {
              id
            }
          }
          allCrossings {
            nodes {
              statusUpdateByLatestStatusUpdateId {
                id
              }
            }
          }
        }
      `);

      expect(response).not.toBeNull();
      done();
    });
  });
}

describe('When querying public data', () => {
  var superAdminLokka, communityEditorLokka, communityAdminLokka;
  beforeAll(async done => {
    superAdminLokka = await getSuperAdminLokka();
    communityEditorLokka = await getCommunityEditorLokka();
    communityAdminLokka = await getCommunityAdminLokka();
    done();
  });

  shouldWork(anonLokka, 'anonymous user');
  shouldWork(communityAdminLokka, 'community admin');
  shouldWork(communityEditorLokka, 'community editor');
  shouldWork(superAdminLokka, 'super admin');
});
