// aws-config.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'https://050f224b20162fafa27ae20c3371a530.r2.cloudflarestorage.com',
  accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY_ID,  
  secretAccessKey: process.env.REACT_APP_R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

module.exports = s3;
