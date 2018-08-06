const nodemailer = require('nodemailer');
const Client = require('pg').Client;
const jwt = require('jsonwebtoken');

const { sendEmail } = require('./emailer');
const { logError } = require('./logger');

function sendOngoingClosureEmail(communityId, ongoingClosureCount) {

}

async function queryAndAlertCommunity(pgClient, lokka, communityId) {
  const pgres = pgClient.query(
    `select count(0) from floods.crossing c
      where c.latest_status_id in (2, 3)
      and c.community_ids @> $1
      and c.latest_status_ceated_at < now() - '1 day'::interval
    `,
    [[communityId]],
  );
  const ongoingClosureCount = pgres.rows[0].count;

  if (ongoingClosureCount === 0) {
    return;
  }


}

module.exports.handle = handle;
async function handle(event, context, cb) {
  const pgClient = new Client(process.env.PGCON);
  const { email } = JSON.parse(event.body);

  // TODO: Make a new user and store it in encrypted travis env variable
  // https://github.com/cityofaustin/ctxfloods/issues/200
  const lokka = await getAuthorizedLokka('superadmin@flo.ods', 'texasfloods');

  pgClient.connect();

  pgClient
    .query(
      `select comm.id, count(0)
        from floods.crossing c, (select id from floods.community) as comm
        where c.latest_status_id in (2, 3)
        and c.community_ids @> ARRAY[comm.id]
        and c.latest_status_created_at < now() - '1 day'::interval
        group by comm.id;

      `,
      [[9018]],
    )
    .then(pgres => {

      if (!pgres.rowCount) {
        const response = {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          },
          body: `Could not find user accont for email: ${email}`,
        };

        cb(null, response);
        return;
      }

      console.log(pgres.rows[0].count);

      return sendResetEmail(firstname, lastname, email, token, cb);
    })
    .catch(err => logError(err))
    .then(() => pgClient.end());
}

handle({ body: '{}' });
