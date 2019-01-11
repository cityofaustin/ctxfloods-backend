const handlebars = require('handlebars');

const { getAuthorizedLokka } = require('./graphql');
const { sendEmail } = require('./emailer');
const { logError } = require('./logger');
const { verifyCaptcha } = require('./captcha');

async function newIncidentReport(lokka, incidentReport) {
  const response = await lokka.send(
    `
    mutation (
      $notes: String,
      $locationDescription: String,
      $longitude: BigFloat,
      $latitude: BigFloat,
      $communityIds: [Int],
    ) {
      newIncidentReport(input:{
        notes: $notes,
        locationDescription: $locationDescription,
        longitude: $longitude,
        latitude: $latitude,
        communityIds: $communityIds,
      }) {
        incidentReport {
          id,
          notes,
          locationDescription,
          coordinates,
          communityIds,
        }
      }
    }
  `,
    incidentReport,
  );

  return response.newIncidentReport.incidentReport;
}

async function findUsersInCommunities(lokka, incidentReport) {
  const response = await lokka.send(
    `
    query (
      $communityIds: [Int],
    ) {
      findUsersInCommunities(communityIds: $communityIds) {
        nodes {
          firstName
          lastName
          emailAddress
        }
      }
    }
  `,
    incidentReport,
  );

  return response.findUsersInCommunities.nodes;
}

const AdminEmailTextTemplate = handlebars.compile(
  `
Report ID: {{reportId}}
Notes: {{notes}}
Location description: {{locationDescription}}
{{#if latitude}}
{{#if longitude}}
Coordinates: {{latitude}},{{longitude}}  https://www.google.com/maps/?q={{latitude}},{{longitude}}
{{/if}}
{{/if}}
Incidents are created at {{frontendURL}}/report-incident
`.trim(),
);

const AdminEmailHtmlTemplate = handlebars.compile(
  `
<h3>Report ID: {{reportId}}</h3>
<p>Notes: {{notes}}</p>
<p>Location description: {{locationDescription}}</p>
{{#if latitude}}
{{#if longitude}}
<p>Coordinates: <a href="https://www.google.com/maps/?q={{latitude}},{{longitude}}" target="_blank">{{latitude}},{{longitude}}</a></p>
{{/if}}
{{/if}}
<p>Incidents are created at <a href="{{frontendURL}}/report-incident" target="_blank">http://{{frontendURL}}/report-incident</a></p>
`.trim(),
);

async function sendEmailToAdmin({
  user: { firstName, lastName, emailAddress },
  incidentReport,
  createdReport,
  frontendURL
}) {
  const reportId = createdReport.id;
  const templateData = {
    ...incidentReport,
    reportId,
    frontendURL,
  };
  await sendEmail({
    from: 'CTXfloods <ctxfloodstestmailer@gmail.com>',
    to: `${firstName} ${lastName} <${emailAddress}>`,
    subject: `Incident report #${reportId}`,
    text: AdminEmailTextTemplate(templateData),
    html: AdminEmailHtmlTemplate(templateData),
  });
}

module.exports.handle = async (event, context, cb) => {
  try {
    const incidentReport = JSON.parse(event.body);
    const frontendURL = event.headers.origin;

    await verifyCaptcha(incidentReport.recaptchaResponse);

    const lokka = await getAuthorizedLokka(process.env.GRAPHQL_API_USR, process.env.GRAPHQL_API_PW);

    const createdReport = await newIncidentReport(lokka, incidentReport);

    const users = await findUsersInCommunities(lokka, incidentReport);

    // Send email in series
    // Not sure if we need it or not, but I figure it could help avoid being rate limited by gmail
    for (var user of users) {
      await sendEmailToAdmin({ user, incidentReport, createdReport, frontendURL });
    }

    cb(null, {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usersNotifiedCount: users.length,
        createdReport,
      }),
    });
  } catch (err) {
    logError(err);
    cb(null, {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: {
        errorMessage: err.message,
      },
    });
  }
};
