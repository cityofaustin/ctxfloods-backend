const fs = require('fs');
const util = require('util');
const dsv = require('d3-dsv');
const readFile = util.promisify(fs.readFile);

const { getAuthorizedLokka } = require('../../handlers/graphql');

const LegacyCrossingsCsvPath = `${__dirname}/legacyCrossings.csv`;

async function loadCsv(path) {
  const str = await readFile(path, 'utf-8');
  return dsv.csvParseRows(str)
}

async function addLegacyCrossings(client) {
  const crossings = await loadCsv(LegacyCrossingsCsvPath);
  let header = true;
  // Hack to get around graphql infrastructure
  await client.query(`select set_config('jwt.claims.role','floods_super_admin', false)`);
  await client.query(`select set_config('jwt.claims.community_id','floods_community_admin', false)`);
  await client.query(`select set_config('jwt.claims.user_id','1', false)`);
  const queryText = `select floods.seed_legacy_crossing($3::text, $4::text, $1::integer, $6::decimal, $5::decimal, $7::text, $2::integer, $8::integer)`
  for (crossing of crossings) {
    if (header) {
      header = false;
      continue
    }
    crossing[1] = crossing[1] || null;
    crossing[7] = crossing[7] || null;
    await client.query(queryText, crossing);
  }
}

module.exports = addLegacyCrossings;
