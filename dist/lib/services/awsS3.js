"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUpload = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("../../logger"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("config"));
(0, dotenv_1.config)();
aws_sdk_1.default.config.update({ region: "me-south-1" });
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: config_1.default.get("awsAccessKey"),
    secretAccessKey: config_1.default.get("awsSecretKey"),
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
exports.imageUpload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: "bucketttp",
        acl: "public-read",
        key: function (req, file, cb) {
            logger_1.default.info({ s3File: file });
            cb(null, path_1.default.basename(file.originalname, path_1.default.extname(file.originalname)) +
                "-" +
                Date.now() +
                path_1.default.extname(file.originalname));
        },
    }),
    //   limits: { fileSize: 150000000 }, // In bytes: 2000000 bytes = 2 MB
});
