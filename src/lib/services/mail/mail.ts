import { config } from "dotenv";
import nodemailer from "nodemailer";
import logger from "../../../logger";

config();

interface Data {
  email: string;
  path: string;
  token: string;
  subject: string;
  body: string;
}

const sendMail = async (data: Data) => {
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
      to: data.email,
      subject: `${data.subject} TTP`,
      text: `${data.body} ${process.env.FRONT_END_URL}/${data.path}/${data.token}`,
      html: `<h1>
      <a href="${process.env.FRONT_END_URL}/${data.path}/${data.token}">
      ${data.body}
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
