import { Request, Response } from "express";
import UserController from "../../controllers/user";
import { jwtVerify } from "../../services/auth";

export default async (req: Request, res: Response, next: any) => {
  try {
    // missing or bad authentication => 401 unauthorized
    const token = req.header("Authorization");
    if (!token) return res.status(401).send("Access denied, No token provided");
    const decoded: any = await jwtVerify(token);
    if (!decoded?.id) {
      return res.status(401).send("Invalid Token");
    } else {
      let user = await UserController.findUserById(decoded.id);
      if (user) {
        next();
      } else
        return res
          .status(401)
          .send("Your account is not existed anymore in our database");
    }
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};
