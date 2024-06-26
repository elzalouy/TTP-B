import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { v4 } from "uuid";
const path = require("path");
let dir = __dirname.split("/middlewares");
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
const Mime = [
  "image/png",
  "image/jpeg",
  "image/svg",
  "image/jpg",
  "text/csv",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/gif",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/mp4",
  "video/3gpp",
  "video/quicktime",
  "video/x-ms-wmv",
  "video/x-msvideo",
  "video/mpeg",
  "video/dvd",
  "video/xvid",
  "video/x-flv",
  "video/x-f4v",
  "video/divx",
];
export default function () {
  const storage = multer.diskStorage({
    destination: (
      req: any,
      file: Express.Multer.File,
      cb: DestinationCallback
    ) => {
      cb(null, path.join(dir[0], "/uploads"));
    },
    filename: (req: any, file: Express.Multer.File, cb: FileNameCallback) => {
      const fileName = file.originalname;
      cb(null, fileName);
      //   .toLowerCase().split(" ").join("-");
      // cb(null, v4() + "-" + Date.now() + "-" + fileName);
    },
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (Mime.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(
          new Error(
            "Only .png, .jpg, .jpeg, svg, doc, docx, csv, pdf, power point, GIF, video format allowed! and max size is 10 MB"
          )
        );
      }
    },
  });
  return upload;
}
