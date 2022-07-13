import { config } from "dotenv";
import nodemailer from "nodemailer";
import logger from "../../../logger";
import path from "path";
import fs from "fs"
import handlebars from "handlebars"
import Config from "config";

//reference the plugin
config();

interface Data {
  email: string;
  path: string;
  token: string;
  subject: string;
  body?: string;
  action?: string;
}


const sendMail = async (data: Data) => {
  const filePath = path.join(__dirname, './template/template.hbs');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    action: data.action,
    link: `${Config.get("FrontEndUrl")}/${data.path}/${data.token}`,
    body: data.body,
  };

  const htmlToSend = template(replacements);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
      },
      debug: true, // show debug output
      logger: true // log information in console
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: data.email,
      subject: `${data.subject}`,
      html: htmlToSend,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
        expires: 24 * 60 * 60,
      },
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(result);
    return result;
  } catch (error) {
    logger.info({ sendMailError: error });
  }
};

export default sendMail;
