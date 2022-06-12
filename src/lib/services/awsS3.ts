import AWS from "aws-sdk";
import { config } from "dotenv";
import logger from "../../logger";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import fs from "fs";
import util from "util";

config();

AWS.config.update({ region: "me-south-1" });
const s3 = new AWS.S3({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
  apiVersion: "2022-11-01",
});

// export const uploadFiles = async (file:string,fileName:string,type:string) => {
//   logger.info(file,fileName,type)
//     const params = {
//         Bucket: 'zidbacketnew',
//         Key:fileName,
//         Body:fs.readFileSync(file),
//         ContentType:type,
//         acl:'public-read',
//     }
//     logger.info({params})
//     const makePromise = util.promisify(s3.upload.bind(s3))
//     let data:any = await makePromise(params)
//     logger.info({uploadData:data})
//     return data
// }

// single upload
export const imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "bucketttp",
    acl: "public-read",
    key: function (req, file, cb) {
      logger.info({ s3File: file });
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
  //   limits: { fileSize: 150000000 }, // In bytes: 2000000 bytes = 2 MB
});
