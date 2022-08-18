import { Request, Response } from "express";
import config from "config";
export default async (req: Request, res: Response, next: any) => {
  try {
    let envName = config.get("name");
    if (envName === "TTP development" && process.env.NODE_ENV) next();
    else
      return res
        .status(400)
        .send(
          "Dropping the collection cannot be executed if node environment wasn't in testing mode"
        );
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};
