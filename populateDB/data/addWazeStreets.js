const fs = require('fs');
const util = require('util');

const dsv = require('d3-dsv');

const { getAuthorizedLokka } = require('../../handlers/graphql');

const readFile = util.promisify(fs.readFile);

const WazeStreetsCsvPath = `${__dirname}/wazeStreets.csv`;

async function loadCsv(path) {
  const str = await readFile(path, 'utf-8');
  return dsv.csvParse(str);
}

async function addWazeStreets() {
  const lokka = await getAuthorizedLokka('superadmin@flo.ods', 'texasfloods');

  let wazeStreetsCsv = await loadCsv(WazeStreetsCsvPath);
  for (wazeStreet of wazeStreetsCsv) {
    wazeStreet.createdAt = new Date(wazeStreet.createdAt);
    wazeStreet.updatedAt = new Date(wazeStreet.updatedAt);
    const result = await lokka.send(
      `
      mutation(
        $id: Int,
        $longitude: Float,
        $latitude: Float,
        $distance: Float,
        $name: String,
        $names: [String],
        $createdAt: Datetime,
        $updatedAt: Datetime,
      ) {
        newWazeStreetWithId(input: {
          id: $id,
          longitude: $longitude,
          latitude: $latitude,
          distance: $distance,
          name: $name,
          names: $names,
          createdAt: $createdAt,
          updatedAt: $updatedAt,
        }) {
          wazeStreet {
            id
          }
        }
      }
    `,
      wazeStreet,
    );
    // console.log(
    //   `Added wazeStreet ${result.newWazeStreetWithId.wazeStreet.id} to DB`,
    // );
  }
}

module.exports = addWazeStreets;
