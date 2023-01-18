import { config } from "dotenv";
import { createServer } from "http";
import express from "express";
import cookieParser from "cookie-parser";
import mongoDB from "./lib/startup/db/dbConnect";
import appSocket from "./lib/startup/socket";
import i18n from "./lib/startup/i18n/config";
import morgan from "morgan";
import cors from "cors";
import routes from "./lib/startup/routes";
import prod from "./lib/startup/prod";
import cronJobs from "./lib/startup/cron";
import logger from "./logger";
const Config = require("config");

const app = express();
prod(app);
export const http = createServer(app);
export const io = appSocket(http);
function server() {
  try {
    //Express App
    app.use(express.json());
    app.use(express.static("/src/lib/uploads"));
    app.use(cors());
    app.use(cookieParser());
    app.use(morgan("dev"));
    app.use(express.urlencoded({ extended: false }));
    app.use(i18n.init);
    mongoDB();
    routes(app);
    config();
    let port = process.env.PORT || 5000;
    http.listen(port, function () {
      console.log("Welcome to", Config.get("name"));
      console.log({
        cards_webhook: Config.get("trelloWebhookUrlTask"),
      });
      console.log("server listen to port " + port);
      cronJobs(io);
    });
  } catch (error) {
    logger.error({ message: error });
  }
}
server();
