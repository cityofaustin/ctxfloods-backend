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
      $longitude: Float,
      $latitude: Float,
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
Coordinates: {{latitude}},{{longitude}}  https://www.google.com/maps/?q={{latitude}},{{longitude}}
Incidents are created at http://{{FRONTEND_URL}}/report-incident
`.trim(),
);

const AdminEmailHtmlTemplate = handlebars.compile(
  `
<h3>Report ID: {{reportId}}</h3>
<p>Notes: {{notes}}</p>
<p>Location description: {{locationDescription}}</p>
<p>Coordinates: <a href="https://www.google.com/maps/?q={{latitude}},{{longitude}}" target="_blank">{{latitude}},{{longitude}}</a></p>
<p>Incidents are created at <a href="http://{{FRONTEND_URL}}/report-incident" target="_blank">http://{{FRONTEND_URL}}/report-incident</a></p>
`.trim(),
);

async function sendEmailToAdmin({
  user: { firstName, lastName, emailAddress },
  incidentReport,
  createdReport,
}) {
  const reportId = createdReport.id;
  const templateData = {
    ...incidentReport,
    reportId,
    FRONTEND_URL: process.env.FRONTEND_URL,
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

    await verifyCaptcha(incidentReport.recaptchaResponse);

    // TODO: Make a new user and store it in encrypted travis env variable
    // https://github.com/cityofaustin/ctxfloods/issues/200
    const lokka = await getAuthorizedLokka('superadmin@flo.ods', 'texasfloods');

    const createdReport = await newIncidentReport(lokka, incidentReport);

    const users = await findUsersInCommunities(lokka, incidentReport);

    // Send email in series
    // Not sure if we need it or not, but I figure it could help avoid being rate limited by gmail
    for (var user of users) {
      await sendEmailToAdmin({ user, incidentReport, createdReport });
    }

    cb(null, {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: {
        usersNotifiedCount: users.length,
        createdReport,
      },
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
