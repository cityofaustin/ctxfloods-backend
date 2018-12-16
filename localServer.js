const express = require('express');
const cors = require('cors');

const xmlHandler = require('./handlers/xmlHandler');
const wazeFeedHandler = require('./handlers/wazeFeedHandler');
const incidentReportHandler = require('./handlers/incidentReportHandler');
const graphqlHandler = require('./handlers/graphqlHandler');
const resetEmailHandler = require('./handlers/resetEmailHandler');
const syncLegacyHandler = require('./handlers/syncLegacyHandler');
const pushNotificationHandler = require('./handlers/pushNotificationHandler');
const cameraScrapeHandler = require('./handlers/cameraScrapeHandler');

const app = express();
app.use(cors());
app.use(express.json({ limit: '500kb', extended: true})); // High Limit is required for scrape_cameras
app.use(express.urlencoded({ limit: '500kb', extended: true }));

app.get('/xml', (req, res) => {
  xmlHandler.handle(null, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Content-Type', response.headers['Content-Type']);
    res.send(response.body);
  });
});

app.get('/waze/feed', (req, res) => {
  wazeFeedHandler.handle(null, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Content-Type', response.headers['Content-Type']);
    res.send(response.body);
  });
});

app.all('/graphql', (req, res) => {
  var event = req.body;
  event.headers = req.headers;
  graphqlHandler.handle(req.body, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ data: response.data, errors: response.errors }));
  });
});

app.post('/incident/report', (req, res) => {
  // AWS gets body as stringified json
  req.body = JSON.stringify(req.body);
  incidentReportHandler.handle(req, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['Content-Type']);
    res.send(response.body);
  });
});

app.post('/email/reset', (req, res) => {
  // AWS gets body as stringified json
  req.body = JSON.stringify(req.body);
  resetEmailHandler.handle(req, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(response);
  });
});

app.get('/sync_legacy', (req, res) => {
  // AWS gets body as stringified json
  req.body = JSON.stringify(req.body);

  syncLegacyHandler.handle(req, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(response);
  });
});

app.get('/send_push_notifications', (req, res) => {
  // AWS gets body as stringified json
  req.body = JSON.stringify(req.body);

  pushNotificationHandler.handle(req, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(response);
  });
});

app.get('/scrape_cameras', (req, res) => {
  // AWS gets body as stringified json
  req.body = JSON.stringify(req.body);

  cameraScrapeHandler.handle(req, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(response);
  });
});

const server = app.listen(process.env.BACKEND_PORT, () => {
  console.log('Local Server started');
});

process.on('SIGTERM', () => {
  console.log('Signal Terminated - closing express server');
  server.close();
});

process.on('SIGINT', () => {
  console.log('Signal Interrupted - closing express server');
  server.close();
});

process.on('exit', () => {
  console.log("Process Exiting - closing express server");
  server.close();
})

module.exports = server;
