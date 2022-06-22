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
const Config = require("config");

const app: Application = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);
mongoDB();
routes(app);
const http = createServer(app);
// .env
config();
const port = process.env.PORT || 5000;
http.listen(port, function () {
  console.log("Welcome to", Config.get("name"));
  console.log(
    "web hook url will be,",
    Config.get("Trello_Webhook_Callback_Url")
  );
  console.log("server listen to port " + port);
});
// socket & jobs
export const io = appSocket(http);
cronJobsBySocket();
