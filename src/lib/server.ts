import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import mongoDB from "./db/dbConnect";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import AppSocket from "./startup/socket";
import i18n from "./i18n/config";

const ngrok = require("ngrok");

const app: Application = express();
export const http = createServer(app);
app.use(cors());
export const io = new Server(http);
app.use(cookieParser());

// middlewares
app.use(morgan("dev"));

// for parsing application/json
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// MongoDB init
mongoDB();
AppSocket(io);
// i18n init
app.use(i18n.init);

// if (process.env.NODE_ENV === "development") {
//   ngrok.connect(
//     {
//       proto: "http",
//       addr: process.env.PORT,
//     },
//     (err: any) => {
//       if (err) {
//         console.error("Error while connecting Ngrok", err);
//         return new Error("Ngrok Failed");
//       }
//     }
//   );
// }
require("./startup/routes")(app);
app.disable("etag");

// start my notification cron job
require("./services/cronJobNotifi/cronJobNotifi");
