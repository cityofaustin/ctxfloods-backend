const fs = require('fs');
const util = require('util');

const dsv = require('d3-dsv');

const { getAuthorizedLokka } = require('../../handlers/graphql');

const readFile = util.promisify(fs.readFile);

const WazeStreetsCsvPath = `${__dirname}/wazeStreets.csv`;

// set empty arrays rather than an array with an empty string
const parseNames = (names) => {
  return (names) ? names.split(',') : []
}

async function loadCsv(path) {
  const str = await readFile(path, 'utf-8');
  return dsv.csvParseRows(str);
}

async function addWazeStreets(client) {
  let wazeStreetsCsv = await loadCsv(WazeStreetsCsvPath);
  let header = true;
  const queryText = `select floods.new_waze_street_with_id($8, $1, $2, $7, $3, $4::text[], $5, $6)`
  for (wazeStreet of wazeStreetsCsv) {
    if (header) {
      header = false;
      continue
    }
    wazeStreet[3] = parseNames(wazeStreet[3])
    wazeStreet[4] = new Date(wazeStreet[4]);
    wazeStreet[5] = new Date(wazeStreet[5]);
    await client.query(queryText, wazeStreet);
  }
}

module.exports = addWazeStreets;
