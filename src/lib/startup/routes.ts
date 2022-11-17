import { Application } from "express";

import userRoutes from "../routes/user/userRoute";
import boardRoutes from "../routes/board/boardRoute";
import authRoute from "../routes/auth/authRoute";
import depRoute from "../routes/department/depRoute";
import projectRoute from "../routes/project/projectRoute";
import taskRoute from "../routes/task/taskRoute";
import categoryRoute from "../routes/category/categoryRoute";
import clientRoute from "../routes/client/clientRoute";
import notifiRoute from "../routes/notification/notifiRoute";
import Config from "config";
export default function (app: Application) {
  app.use(function (req, res, next) {
    let allowedOrigins = [
      "http://" + Config.get("frontEndUrl"),
      "https://" + Config.get("frontEndUrl"),
    ];
    let origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Key, x-auth-token, multipart/form-data"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, GET, DELETE, OPTIONS"
    );
    next();
  });
  app.use("/api", authRoute);
  app.use("/api", taskRoute);
  app.use("/api", userRoutes);
  app.use("/api", boardRoutes);
  app.use("/api", depRoute);
  app.use("/api", projectRoute);
  app.use("/api", categoryRoute);
  app.use("/api", clientRoute);
  app.use("/api", notifiRoute);
}
