import { Request, Response } from "express";
import { jwtVerify } from "../../services/auth";
export default async (req: Request, res: Response, next: any) => {
  try {
    const token = req.header("authorization");
    if (!token) return res.status(401).send("Access denied, No token provided");
    const decoded: any = await jwtVerify(token);
    if (!decoded?.id) {
      return res.status(400).send("Invalid Token");
    }
    if (decoded.role !== "SM")
      return res
        .status(401)
        .send("Un-authenticated, you should be authenticated to do this job ");
    next();
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};
