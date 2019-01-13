const axios = require('axios');
const _ = require('lodash');

const { getAuthorizedLokka } = require('./graphql');
const { logError } = require('./logger');

const getCamerasBySource = (lokka, source) => {
  return lokka.send(
    `
    query getCamerasBySource(
      $source: String
    ) {
      allCameras(condition: {source: $source}){
      	edges {
          node {
            id
            name
            sourceId
          }
        }
      }
    }
    `,
    {source}
  );
}

const addCameraImage = (lokka, params) => {
  return lokka.send(
    `
    mutation ($cameraId: Int!, $url: String!, $uploadedAt: Datetime) {
      addCameraImage(input:{cameraId:$cameraId, url:$url, uploadedAt:$uploadedAt}) {
    		integer
      }
    }
  `,
    params,
  );
}

const downloadImage = (url) => {
  return axios.get(url, {
    responseType: 'arraybuffer',
  })
  .then(result => Buffer.from(result.data, 'binary').toString('base64'))
}

const handleAtdImages = (lokka) => {
  let cameras;
  // 1. retrieve ATD cameras that ctxfloods has stored in its database
  return getCamerasBySource(lokka, "atd")
  .then((data) => {
    cameras = data.allCameras.edges.map(c=>c.node);
    const cameraIds = cameras.map(c=>c.sourceId);
    // 2. Get up-to-date screenshot_addresses for our ATD cameras
    const params = {
      $select: "camera_id,screenshot_address",
      $where: `camera_id in (${cameraIds.map(i=>`"${i}"`).join(', ')})`,
    }
    if (process.env.AUSTIN_DATA_APP_TOKEN) {
      params.$$app_token = process.env.AUSTIN_DATA_APP_TOKEN;
    }
    return axios.get("https://data.austintexas.gov/resource/fs3c-45ge.json", {params})
  })
  .then((res) => {
    const cameraMetaData = res.data;
    // 3. For each camera, download the most current image
    const saveImageJobs = cameras.map(c => {
      const url = _.find(cameraMetaData, {camera_id: c.sourceId}).screenshot_address;
      // 4. Save image url to database
      if (url) {
        return addCameraImage(lokka, {
          url: url,
          cameraId: c.id,
        })
        .catch((err) => {
          logError(`Failed to add atd image for camera ${c.id}`);
          logError(err);
        });
      }
    })
    return Promise.all(saveImageJobs)
  })
  .catch((err) => {
    logError(`Failed to fetch atd images`);
    logError(err);
  });
}

const handleBeholderImages = (lokka) => {
  // 1. retrieve Beholder cameras that ctxfloods has stored in its database
  return getCamerasBySource(lokka, 'beholder')
  .then((data) => {
    const cameras = data.allCameras.edges.map(c=>c.node);
    // 2. For each camera, get url of latest photo taken
    const saveImageJobs = cameras.map(c => {
      return axios.get(`https://map.beholderhq.com/api/v1/beholderhq/cameras/${c.sourceId}`)
      .then((res) => {
        const latestPhotoId = res.data.data.attributes['latest-photo-id'];
        if (latestPhotoId) {
          const url = `https://assets.beholderhq.com/v3/photos/${latestPhotoId}-original.jpg`;
          // 3. Save image url to database
          return addCameraImage(lokka, {
            url,
            cameraId: c.id,
          })
        }
      })
      .catch((err) => {
        logError(`Failed to get beholder image for camera ${c.id}`);
        logError(err);
      })
    });
    return Promise.all(saveImageJobs)
  })
}

module.exports.handle = (event, context, cb) => {
  return getAuthorizedLokka(process.env.GRAPHQL_API_USR, process.env.GRAPHQL_API_PW)
  .then((result) => {
    lokka = result;
    return Promise.all([
      handleAtdImages(lokka),
      handleBeholderImages(lokka)
    ])
  })
  .then(()=>{
    cb(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    })
  })
  .catch((err) => {
    logError(err);
    cb(null, { statusCode: 500, errors: [err] });
  })
}
