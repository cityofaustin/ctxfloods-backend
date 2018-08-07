const handlebars = require('handlebars');

const { sendEmail } = require('./emailer');
const { logError } = require('./logger');
const { getAnonLokka } = require('./graphql');

const AdminEmailTemplate = handlebars.compile(
  `{{count}} crossings in {{communityName}} have been marked as closed or caution for over 24 hours.`.trim(),
);

async function sendOngoingClosureEmail(emailData) {
  const templateData = {
    ...emailData,
    FRONTEND_URL: process.env.FRONTEND_URL,
  };
  await sendEmail({
    from: 'CTXfloods <ctxfloodstestmailer@gmail.com>',
    to: `${emailData.firstName} ${emailData.lastName} <${emailData.emailAddress}>`,
    subject: `${emailData.count} crossings closed over 24 hours`,
    text: AdminEmailTemplate(templateData),
    html: AdminEmailTemplate(templateData),
  });
}

module.exports.handle = handle;

async function handle(event, context, cb) {
  const lokka = await getAnonLokka();

  const response = await lokka.send(`
    query {
      ongoingClosureCountByCommunity {
        nodes {
          communityId
          count
          communityByCommunityId {
            name
            usersByCommunityId {
              nodes {
                firstName
                lastName
                emailAddress
              }
            }
          }
        }
      }
    }
  `);

  const emails = response.ongoingClosureCountByCommunity.nodes.reduce(
    (emails, node) => {
      return [
        ...emails,
        ...node.communityByCommunityId.usersByCommunityId.nodes.map(user => ({
          ...user,
          communityId: node.communityId,
          count: node.count,
          communityName: node.communityByCommunityId.name,
        })),
      ];
    },
    [],
  );

  for (const emailData of emails) {
    await sendOngoingClosureEmail(emailData);
  }
}

handle({ body: '{}' });
