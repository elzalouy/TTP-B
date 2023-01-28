import bcrypt from "bcrypt";
import logger from "../../logger";
import { localize } from "../utils/msgLocalize";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
import { customeError } from "../utils/errorUtils";
import { IUser, UserData } from "../types/model/User";
import Config from "config";
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

export const createJwtToken: (user: IUser | UserData) => string = (user) => {
  let jwtGenerate = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    Config.get("jwtSecret"),
    {
      expiresIn: 30 * 24 * 60 * 60, // Our token expires after 30 days
      audience: Config.get("jwtAudience"),
      issuer: Config.get("jwtIssue"),
    }
  );
  return jwtGenerate;
};

export const jwtVerify = async (token: string) => {
  try {
    token = token.split(" ")[1];
    let jwtVerify: any = await jwt.verify(token, Config.get("jwtSecret"), {
      audience: Config.get("jwtAudience"),
      issuer: Config.get("jwtIssue"),
    });
    return jwtVerify;
  } catch (error) {
    return error;
  }
};
