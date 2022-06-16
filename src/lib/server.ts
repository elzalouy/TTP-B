import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import mongoDB from "./db/dbConnect";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import AppSocket from "./startup/socket";
import i18n from "./i18n/config";
import config from "config";
const ngrok = require("ngrok");
const app: Application = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);
mongoDB();
export const http = createServer(app);
export const io = new Server(http, {
  cors: {
    origin: config.get("FrontEndUrl"),
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 5000,
  pingTimeout: 0,
});
AppSocket(io);

require("./startup/routes")(app);
app.disable("etag");

require("./services/cronJobNotifi");
