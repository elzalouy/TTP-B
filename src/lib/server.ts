import { createServer } from "http";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import mongoDB from "./db/dbConnect";
import appSocket from "./startup/socket";
import i18n from "./i18n/config";
import morgan from "morgan";
import cors from "cors";
import routes from "./startup/routes";
import cluster from "cluster";
const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");

// declerations
const app: Application = express();
// app uses
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);
// functions
mongoDB();
routes(app);
require("./services/cronJobNotifi");
// servers
export const http = createServer(app);
export const io = appSocket(http);
