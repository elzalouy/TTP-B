import { config } from "dotenv";
import nodemailer from "nodemailer";
import logger from "../../../logger";

config();

const sendMail = async (
  email: string,
  token: string,
  page: string,
  subject: string
) => {
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
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: subject,
      text: `Click this link to continue ${process.env.FRONT_END_URL}${page}/${token}`,
      html: `<h1>
      <a href="${process.env.FRONT_END_URL}${page}/${token}">
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

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    logger.info({ sendMailError: error });
  }
};

export default sendMail;
