"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path = require("path");
let dir = __dirname.split("/services");
const Mime = [
    "image/png",
    "image/png",
    "image/jpeg",
    "image/svg",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/gif",
    "application/pdf",
];
function default_1() {
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(dir[0], "/uploads"));
        },
        filename: (req, file, cb) => {
            const fileName = file.originalname.toLowerCase().split(" ").join("-");
            cb(null, (0, uuid_1.v4)() + "-" + Date.now() + "-" + fileName);
        },
    });
    const upload = (0, multer_1.default)({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (Mime.includes(file.mimetype.toLowerCase())) {
                cb(null, true);
            }
            else {
                cb(null, false);
                return cb(new Error("Only .png, .jpg, .jpeg, svg, doc, docx, csv, pdf, and GIF  format allowed!"));
            }
        },
    });
    return upload;
}
exports.default = default_1;