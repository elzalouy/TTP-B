import { Request, Response } from "express";
import { jwtVerify } from "../../services/auth";
export default async (req: Request, res: Response, next: any) => {
  try {
    const token = req.header("authorization");
    const decoded: any = await jwtVerify(token);
    if (decoded.role === "OM" || decoded.role === "SM") next();
    else
      return res
        .status(403)
        .send(
          "Un-authenticated, you should be a Operation Manager or Super Manager to access this action. "
        );
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};
