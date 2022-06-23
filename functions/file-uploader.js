#!/usr/bin/env node

const AWS = require('aws-sdk');
const Busboy = require('busboy');

exports.handler = async (event, context) => {
  try {
    if (!event.body || !event.isBase64Encoded) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "no data",
        }),
      };
    }

    // Attempt to process file and fields sent up in the request using busboy
    const { files } = await processImageUpload(event);
    const file = files[0];

    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "no file uploaded",
        }),
      };
    }

    // Upload to S3
    const { statusCode, body } = await uploadS3File(file);

    if (statusCode !== 200) {
      return {
        statusCode,
        body: JSON.stringify({ body })
      };
    }

    return {
      statusCode,
      body: JSON.stringify({
        name: file.fieldName,
        url: body
      })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error }),
    };
  }
};

const uploadS3File = async (file) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  });
  const PARAMS = {
    Bucket: process.env.BUCKET_NAME,
    Key: Date.now() + '-' + file.fileName.filename,
    Body: file.file,
    ContentType: file.fileName.mimeType
  };

  return new Promise((resolve, reject) => {
    s3.upload(PARAMS, (err, data) => {
      if (err) {
        reject({
          statusCode: 500,
          body: err
        });
      }

      resolve({
        statusCode: 200,
        body: data.Location
      });
    });
  });
};

const processImageUpload = async (event) => {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        ...event.headers,
        "content-type": event.headers["Content-Type"] ?? event.headers["content-type"],
      },
    });

    const result = {
      fields: {},
      files: [],
    };

    busboy.on("file", (_fieldname, file, fileName, encoding, contentType) => {
      file.on("data", (data) => {
        result.files.push({
          file: data,
          fieldName: _fieldname,
          fileName
        });
      });
    });

    // busboy.on("field", (fieldName, value) => {
    //   result.fields[fieldName] = value;
    // });

    busboy.on("finish", () => resolve(result));
    busboy.on("error", (error) => reject(`Parse error: ${error}`));

    // pushes the event data into busboy to start the processing and using the event.isBase64Encoded property to tell which kind of data
    // we're working with
    busboy.write(event.body, event.isBase64Encoded ? "base64" : "binary");

    busboy.end();
  });
};