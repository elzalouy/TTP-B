import { config } from "dotenv";
import nodemailer from "nodemailer";
import logger from "../../../logger";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import Config from "config";

//reference the plugin
config();

interface Data {
  email: string;
  path: string;
  token: string;
  subject: string;
  image?: string;
}

const sendMail = async (data: Data) => {
  const filePath = path.join(__dirname, "./template/template.hbs");
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  // send mail
  const replacements = {
    link: `${Config.get("frontEndUrl")}/${data.path}/${data.token}`,
    image: data.image,
  };

  const htmlToSend = template(replacements);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        clientId: Config.get("mailerClientId"),
        clientSecret: Config.get("mailerClientSecret"),
      },
      debug: true, // show debug output
      logger: true, // log information in console
    });

    const mailOptions = {
      from: `${Config.get("mailerEmailAddress")}`,
      to: data.email,
      subject: `${data.subject}`,
      html: htmlToSend,
      auth: {
        user: Config.get("mailerEmailAddress"),
        refreshToken: Config.get("mailerRefreshToken"),
        accessToken: Config.get("mailerAccessToken"),
        expires: 24 * 60 * 60,
      },
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    logger.info({ sendMailError: error });
  }
};

export default sendMail;
