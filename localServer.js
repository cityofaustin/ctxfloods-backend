const express = require('express');
const cors = require('cors');

const xmlHandler = require('./handlers/xmlHandler');
const wazeFeedHandler = require('./handlers/wazeFeedHandler');
const graphqlHandler = require('./handlers/graphqlHandler');
const resetEmailHandler = require('./handlers/resetEmailHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    res.end(JSON.stringify({data: response.data, errors: response.errors}));
  });
});

app.post('/email/reset', (req, res) => {
  // AWS gets body as stringified json
  const body = JSON.stringify(req.body);
  req.body = body;
  resetEmailHandler.handle(req, null, (error, response) => {
    res.statusCode = response.statusCode;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(response);
  });
});

const server = app.listen(process.env.BACKEND_PORT);

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit();
  });
});
