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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const config_1 = __importDefault(require("config"));
//reference the plugin
(0, dotenv_1.config)();
const sendMail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.join(__dirname, "./template/template.hbs");
    const source = fs_1.default.readFileSync(filePath, "utf-8").toString();
    const template = handlebars_1.default.compile(source);
    // send mail
    const replacements = {
        link: `${config_1.default.get("frontEndUrl")}/${data.path}/${data.token}`,
        image: data.image,
    };
    const htmlToSend = template(replacements);
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                clientId: config_1.default.get("mailerClientId"),
                clientSecret: config_1.default.get("mailerClientSecret"),
            },
            debug: true,
            logger: true, // log information in console
        });
        const mailOptions = {
            from: `${config_1.default.get("mailerEmailAddress")}`,
            to: data.email,
            subject: `${data.subject}`,
            html: htmlToSend,
            auth: {
                user: config_1.default.get("mailerEmailAddress"),
                refreshToken: config_1.default.get("mailerRefreshToken"),
                accessToken: config_1.default.get("mailerAccessToken"),
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
