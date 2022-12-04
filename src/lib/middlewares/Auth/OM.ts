import { Request, Response } from "express";
import { jwtVerify } from "../../services/auth";
export default async (req: Request, res: Response, next: any) => {
  try {
    const token = req.header("authorization");
    const decoded: any = await jwtVerify(token);
    if (decoded.role !== "OM")
      return res
        .status(403)
        .send(
          "Un-authenticated, you should be an Operation manager to do this job "
        );
    next();
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};
