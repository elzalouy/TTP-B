import { Request, Response } from "express";
import { jwtVerify } from "../../services/auth";

export default async (req: Request, res: Response, next: any) => {
  try {
    // missing or bad authentication => 401 unauthorized
    const token = req.header("authorization");
    if (!token) return res.status(401).send("Access denied, No token provided");
    const decoded: any = await jwtVerify(token);
    if (!decoded?.id) {
      return res.status(401).send("Invalid Token");
    }
    next();
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};
