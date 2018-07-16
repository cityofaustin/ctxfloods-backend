const fs = require('fs');
const util = require('util');

const axios = require('axios');
const dsv = require('d3-dsv');
const { get, sortBy } = require('lodash');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const WazeStreetsCsvPath = `${__dirname}/data/wazeStreets.csv`;
const LegacyCrossingsCsvPath = `${__dirname}/data/legacyCrossings.csv`;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeCoords(latitude, longitude) {
  try {
    const res = await axios({
      url: 'https://feed.waze.com/FeedManager/getStreet',
      params: {
        token: process.env.WAZE_GEOCODER_TOKEN,
        lat: latitude,
        lon: longitude,
      },
    });

    const rows = res.data.result.map(result => ({
      latitude: res.data.lat,
      longitude: res.data.lon,
      name: result.names[0],
      names: result.names,
      createdAt: new Date(),
      updatedAt: new Date(),
      distance: result.distance,
    }));

    return rows;
  } catch (err) {
    if (err.response) {
      console.error(err.response.data);
      console.error(err.response.status);
      console.error(err.response.headers);

      if (err.response.status === 503) {
        console.log('503 encountered, retrying in a bit...');
        await delay(60 * 1000);
        return geocodeCoords(latitude, longitude);
      }
    } else if (err.request) {
      console.error(err.request);
    }
    throw err;
  }
}

async function loadCsv(path) {
  const str = await readFile(path, 'utf-8');
  return dsv.csvParse(str);
}

async function writeCsv(pathname, data) {
  const str = dsv.csvFormat(data);
  await writeFile(pathname, str, 'utf-8');
}

async function main() {
  const legacyCrossingsCsv = await loadCsv(LegacyCrossingsCsvPath);
  let wazeStreetsCsv = await loadCsv(WazeStreetsCsvPath);

  let highestWazeStreetId =
    get(sortBy(wazeStreetsCsv, 'id').reverse(), 'id') || 0;

  for (crossing of legacyCrossingsCsv) {
    if (
      !crossing.wazeStreetId &&
      !wazeStreetsCsv.find(
        street =>
          street.latitude === crossing.latitude &&
          street.longitude === crossing.longitude,
      )
    ) {
      let rows = await geocodeCoords(crossing.latitude, crossing.longitude);
      // Sometimes the geocoder finds nothing
      if (rows.length) {
        rows = rows.map((row, i) => ({
          ...row,
          id: ++highestWazeStreetId,
        }));
        wazeStreetsCsv.push.apply(wazeStreetsCsv, rows);
        crossing.wazeStreetId = rows[0].id;

        await writeCsv(LegacyCrossingsCsvPath, legacyCrossingsCsv);
        await writeCsv(WazeStreetsCsvPath, wazeStreetsCsv);
        console.log(`Geocoded "${crossing.name}" to "${rows[0].name}"`);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}

async function fixIds() {
  const legacyCrossingsCsv = await loadCsv(LegacyCrossingsCsvPath);
  let wazeStreetsCsv = await loadCsv(WazeStreetsCsvPath);

  wazeStreetsCsv.forEach((wazeStreet, i) => {
    wazeStreet.id = i;
  });

  for (const crossing of legacyCrossingsCsv) {
    const closestWazeStreet = sortBy(wazeStreetsCsv.filter(
      street =>
        street.latitude === crossing.latitude &&
        street.longitude === crossing.longitude,
    ), 'distance');
    if (closestWazeStreet.length) {
      crossing.wazeStreetId = closestWazeStreet[0].id;
    }
  }

  await writeCsv(LegacyCrossingsCsvPath, legacyCrossingsCsv);
  await writeCsv(WazeStreetsCsvPath, wazeStreetsCsv);
}

try {
  // main();
  fixIds();
} catch (err) {
  console.error(err);
}
