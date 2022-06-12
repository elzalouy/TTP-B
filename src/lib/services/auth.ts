import bcrypt from "bcrypt";
import logger from "../../logger";
import { localize } from "../utils/msgLocalize";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
import { customeError } from "../utils/errorUtils";

config();

export const hashBassword: (password: string) => Promise<string> = async (
  password: string
) => {
  const saltRound: number = 10;
  const salt = await bcrypt.genSalt(saltRound);
  const hash: string = await bcrypt.hash(password, salt);
  return hash;
};

export const comparePassword: (
  password: string,
  hash: string
) => Promise<boolean> = async (password: string, hash: string) => {
  const validPassword = await bcrypt.compare(password, hash);
  return validPassword;
};

export const createJwtToken: (id: string) => string = (id: string) => {
  let jwtGenerate = jwt.sign(
    {
      user: { id },
    },
    process.env.JWT_SECRETE,
    {
      expiresIn: 365 * 24 * 60 * 60, // Our token expires after one day
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUE,
    }
  );
  return jwtGenerate;
};

export const jwtVerify = async (token: string) => {
  try {
    token = token.split(" ")[1];
    let jwtVerify: string | JwtPayload = await jwt.verify(
      token,
      process.env.JWT_SECRETE,
      {
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUE,
      }
    );
    return jwtVerify;
  } catch (error) {
    return error;
  }
};
