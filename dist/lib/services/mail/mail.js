"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../../../logger"));
(0, dotenv_1.config)();
const sendMail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: "Forget Password TTP",
            text: `Click this link to continue http://localhost:3000/forgetPassword/${token}`,
            html: `<h1>
      <a href="http://localhost:3000/forgetPassword/${token}">
        click here
      </a>
      </h1>`,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: process.env.ACCESS_TOKEN,
                expires: 24 * 60 * 60,
            },
        };
        const result = yield transporter.sendMail(mailOptions);
        return result;
    }
    catch (error) {
        logger_1.default.info({ sendMailError: error });
    }
});
exports.default = sendMail;
