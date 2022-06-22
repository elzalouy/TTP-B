import { Express } from "express";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import cluster from "cluster";
import { cpus } from "os";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
import { createServer } from "http";
import appSocket from "./socket";
import cronJobsBySocket from "../services/cronJobNotifi";
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const Config = require("config");

// Server with sticky sessions.
export default function (app: Express) {
  let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> =
    null;
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    const http = createServer(app);
    setupMaster(http, { loadBalancingMethod: "least-connection" });
    setupPrimary();
    http.listen(process.env.PORT, function () {
      console.log("Welcome to", Config.get("name"));
      console.log(
        "web hook url will be,",
        Config.get("Trello_Webhook_Callback_Url")
      );
      console.log("server listen to port " + process.env.PORT);
    });
    for (let i = 0; i < cpus.length; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
    return null;
  } else {
    console.log(`Worker ${process.pid} started`);
    const http = createServer(app);
    let io = appSocket(http);
    io.adapter(createAdapter());
    setupWorker(io);
    cronJobsBySocket(io);
  }
  return io;
}
