const Client = require('pg').Client;
const _ = require('lodash');
const moment = require('moment');

const { sendEmail } = require('./emailer');
const { logError } = require('./logger');
const { frontendURL } = require('./constants');
const { getAuthorizedLokka } = require('./graphql');
const getClient = require('../db/helpers/getClient');

const EmailTextTemplate = _.template(`
Action is required for <%= crossings.length %> crossing<% if (crossings.length !== 1) { %>s<% } %>. Please make sure that their statuses are up to date.
<% if (_.some(crossings, (crossing) => crossing.status == 'Closed' || crossing.status == 'Closed')) { %>\
Please "Open" any crossing set to "Closed" or "Caution" if they are safe. Or escalate them to "Long-Term Closure".\
<% } %>
<% if (_.some(crossings, (crossing) => crossing.status == "Long-Term Closure")) { %>\
Please "Open" or update the date of any crossing set to "Long-Term Closure" that is past its estimated reopen date.\
<% } %>
<% _.each(crossings,(crossing, index) => { %>
<%- index+1 %>: <%- crossing.name %> http://<%= frontendURL %>/dashboard/map/crossing/<%- crossing.id %>
  Status: <%- crossing.status %>
  Reason: <%- crossing.reason %>\
  <% if (crossing.notes) { %>\
  \n  Notes: <%- crossing.notes %>\
  <% } %>\
  <% if (crossing.reopen_date) { %>\
  \n  Reopen Date: <%- moment(crossing.reopen_date).format('YYYY-MM-DD') %>\
  <% } %>
<% }); %>\
`.trim(), {imports: { '_': _, 'moment': moment}});

const EmailHtmlTemplate = _.template(`
<p>Action is required for <%= crossings.length %> crossing<% if (crossings.length !== 1) { %>s<% } %>. Please make sure that their statuses are up to date.</p>
<% if (_.some(crossings, (crossing) => crossing.status == 'Closed' || crossing.status == 'Closed')) { %>\
<p>Please "Open" any crossing set to "Closed" or "Caution" if they are safe. Or escalate them to "Long-Term Closure".</p>\
<% } %>
<% if (_.some(crossings, (crossing) => crossing.status == "Long-Term Closure")) { %>\
<p>Please "Open" or update the date of any crossing set to "Long-Term Closure" that is past its estimated reopen date.</p>\
<% } %>
<% _.each(crossings,(crossing, index) => { %>
<h4><%- index+1 %>: <a href="http://<%= frontendURL %>/dashboard/map/crossing/<%- crossing.id %>" target="_blank"><%- crossing.name %></a></h4>
<ul style="list-style-type:none">
  <li>Status: <%- crossing.status %></li>
  <li>Reason: <%- crossing.reason %></li>
  <% if (crossing.notes) { %>
    <li>Notes: <%- crossing.notes %></li>
  <% } %>
  <% if (crossing.reopen_date) { %>\
    <li>Reopen Date: <%- moment(crossing.reopen_date).format('YYYY-MM-DD') %></li>
  <% } %>
</ul>
<% }); %>\
`.trim(), {imports: { '_': _ , 'moment': moment}});


function newPushLog(lokka, pushLog){
  return lokka.send(
    `
    mutation (
      $date: Date
      $userId: Int
      $communityId: Int
      $statusUpdates: [Int]
      $success: Boolean
      $errorMessage: String
    ) {
      newPushLogFunction(input:{
        date: $date,
        userId: $userId
        communityId: $communityId
        statusUpdates: $statusUpdates,
        success: $success,
        errorMessage: $errorMessage
      }) {
        pushLog {
          id,
          date,
          userId,
          communityId,
          statusUpdates,
          success,
          errorMessage
        }
      }
    }
    `,
    pushLog,
  );
}

module.exports.handle = (event, context, cb) => {
  const pgClient = getClient({clientType: "floodsAPI"});
  const today = moment(new Date()).format('YYYY-MM-DD');
  let emailJobs, lokka, jobErrors=[], successCount=0;

  const expiredCrossingConditions = `
  (
    ((su.status_id = 2 or su.status_id = 3) and created_at < (now() - interval '18 hours')) or
  	((su.status_id = 4) and reopen_date < now())
  )
  `;

  // Step 1: Find all communities that contain crossings requiring push notifications
  pgClient.connect();
  return getAuthorizedLokka(process.env.GRAPHQL_API_USR, process.env.GRAPHQL_API_PW)
  .then((result) => {
    lokka = result;
    return pgClient.query(`\
      select distinct unnest(c.community_ids::int[]) from floods.crossing c \
      join floods.status_update su on su.id = c.latest_status_update_id \
      where ${expiredCrossingConditions};`
    )
  })
  .then(pgres => {
    const communities = pgres.rows.map((row)=>row.unnest);

    if (!communities.length) return;
    // Step 2: Find all users and non-open crossings for each community
    const queryAndEmailJobs = communities.map((communityId)=>{
      return Promise.all([
        pgClient.query(`\
          select id, first_name, last_name, email_address from floods.find_users_in_communities($1::integer[])\
        `,[[communityId]]),
        pgClient.query(`\
          select cr.id, cr.name, st.name as status, sr.name as reason, su.id as status_update_id, su.notes, su.reopen_date from floods.crossing cr\
          join floods.status_update su on su.crossing_id = cr.id\
          join floods.status_reason sr on su.status_reason_id = sr.id\
          join floods.status st on su.status_id = st.id\
          where cr.community_ids @> $1::integer[]\
          and ${expiredCrossingConditions}\
        `,[[communityId]])
      ])
      .then((data)=>{
        const users = data[0].rows;
        const crossings = data[1].rows;

        if (!users.length) {
          return newPushLog(lokka,{
            date: today,
            userId: null,
            communityId: communityId,
            statusUpdates: crossings.map((cr)=>cr.status_update_id),
            success: false,
            errorMessage: "No users for community"
          })
          .catch((err)=>{
            jobErrors.push(err);
            logError(err);
          })
        }
        // Step 3: Send an email to each user about all crossings in their jurisdiction that need to be managed.
        emailJobs = users.map((user)=>{
          const templateData = {
            crossings,
            frontendURL
          };
          return sendEmail({
            from: 'CTXfloods <ctxfloodstestmailer@gmail.com>',
            to: `${user.first_name} ${user.last_name} <${user.email_address}>`,
            subject: `Crossings Require Update - ${moment(new Date()).format('YYYY-MM-DD')}`,
            text: EmailTextTemplate(templateData),
            html: EmailHtmlTemplate(templateData),
          })
          .then(()=>{
            successCount++;
            return newPushLog(lokka,{
              date: today,
              userId: user.id,
              communityId: communityId,
              statusUpdates: crossings.map((cr)=>cr.status_update_id),
              success: true,
              errorMessage: null
            })
            .catch((err)=>{
              jobErrors.push(err);
              logError(err);
            })
          })
          .catch((err)=>{
            jobErrors.push(err);
            logError(err);
            return newPushLog(lokka,{
              date: today,
              userId: user.id,
              communityId: communityId,
              statusUpdates: crossings.map((cr)=>cr.status_update_id),
              success: false,
              errorMessage: err.message
            })
            .catch((err)=>{
              jobErrors.push(err);
              logError(err);
            })
          })
        });
        return Promise.all(emailJobs)
      })
      .catch((err)=>{
        jobErrors.push(err);
        logError(err);
      })
    });
    return Promise.all(queryAndEmailJobs)
  })
  .then((data) => {
    if (jobErrors.length) {
      cb(null, {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        errors: jobErrors,
      });
    } else {
      cb(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: `${successCount} emails sent.`,
      })
    }
  })
  .catch(err => {
    logError(err);
    cb(null, {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      errors: [err],
    });
  })
  .then(() => pgClient.end());
};
