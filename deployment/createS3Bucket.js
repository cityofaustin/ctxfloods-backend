const bucketName = process.argv[2];

const aws = require('aws-sdk');

const s3 = new aws.S3();

s3.listBuckets((err, data) => {
  if (err) {
    console.log('Error', err);
    return;
  }

  if (data.Buckets.find(bucket => bucket.Name === bucketName)) {
    console.log(`Bucket "${bucketName}" already exists.`);
  }

  /**
  Warning: Adding "LocationConstraint" param will break for our region (us-east-1).
  But, "LocationConstraint" would be required for any other region.
  https://docs.aws.amazon.com/cli/latest/reference/s3api/create-bucket.html#examples
  **/
  const bucketParams = {
    Bucket: bucketName
  };

  s3.createBucket(bucketParams, (err, data) => {
    if (err) {
      console.log(`Bucket "${bucketName}" failed to build.`, err);
      throw err;
    } else {
      console.log(`Bucket "${bucketName}" built in region ${data.Location}`);
    }
  });
});
