import { config } from "dotenv";
import { createServer } from "http";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import mongoDB from "./lib/db/dbConnect";
import appSocket from "./lib/startup/socket";
import i18n from "./lib/i18n/config";
import morgan from "morgan";
import cors from "cors";
import routes from "./lib/startup/routes";
import cronJobsBySocket from "./lib/services/cronJobNotifi";
import listenMultiNodes from "./lib/startup/prod";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Server } from "socket.io";
const Config = require("config");
//Express App
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);
mongoDB();
routes(app);
config();
let port = process.env.PORT || 5000;
console.log(process.env.NODE_ENV);
export const http = createServer(app);
http.listen(port, function () {
  console.log("Welcome to", Config.get("name"));
  console.log(
    "web hook url will be,",
    Config.get("Trello_Webhook_Callback_Url")
  );
  console.log("server listen to port " + port);
});
export const io = appSocket(http);
cronJobsBySocket(io);
