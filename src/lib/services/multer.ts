import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { v4 } from "uuid";
const path = require("path");
let dir = __dirname.split("/services");
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
const Mime = [
  "image/png",
  "image/png",
  "image/jpeg",
  "image/svg",
  "text/csv",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/gif",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
export default function () {
  const storage = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: DestinationCallback
    ) => {
      cb(null, path.join(dir[0], "/uploads"));
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: FileNameCallback
    ) => {
      const fileName = file.originalname.toLowerCase().split(" ").join("-");
      cb(null, v4() + "-" + Date.now() + "-" + fileName);
    },
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      if (Mime.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(
          new Error(
            "Only .png, .jpg, .jpeg, svg, doc, docx, csv, pdf, power point and GIF  format allowed! and max size is 10 MB"
          )
        );
      }
    },
  });
  return upload;
}
