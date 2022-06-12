import { Request, Response } from "express";
import UserController from "../../controllers/user";
import { jwtVerify } from "../../services/auth";
export default async (req: Request, res: Response, next: any) => {
  try {
    const token = req.header("Authorization");
    // missing or bad authentication => 401 unauthorized
    // not authorized to perform a task => 403 forbidden
    if (!token) return res.status(401).send("Access denied, No token provided");
    const decoded: any = await jwtVerify(token);
    if (!decoded?.user?.id) {
      return res.status(401).send("Invalid Token");
    }
    let user = await UserController.getUserById(decoded?.user?.id);
    if (user.role !== "PM")
      return res
        .status(401)
        .send("Un-authenticated, you should be authenticated to do this job ");
    next();
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};
