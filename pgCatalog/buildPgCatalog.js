const fs = require('fs');
const Client = require('pg').Client;
const minify = require('pg-minify');

var client = new Client(require('../handlers/constants').PGCON_BUILD_SCHEMA);
client.connect();

fs.readFile(
  './node_modules/postgraphql/resources/introspection-query.sql',
  (err, data) => {
    client
      .query({
        name: 'introspectionQuery',
        text: minify(data.toString()),
        values: [['floods']],
      })
      .then(res => {
        const out = res.rows.map(function(x) {
          return x.object;
        });
        fs.writeFile('./pgCatalog/pgCatalog.json', JSON.stringify(out), err => {
          if (err) {
            console.log(err);
          }
          console.log('Wrote pgCatalog to /pgCatalog/pgCatalog.json');
        });
      })
      .then(() => client.end())
      .catch(err => console.log(err));
  },
);
