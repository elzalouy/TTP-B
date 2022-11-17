import config from "config";
import _ from "lodash";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { userSocket } from "../types/controller/user";
export let socketPMs: userSocket[] = [];
export let socketOM: userSocket[] = [];
export default function appSocket(http: any) {
  const io = new Server(http, {
    path: "/socket.io",
    cors: {
      origin: config.get("frontEndUrl"),
      methods: "*",
      allowedHeaders: ["Content-type"],
      credentials: true,
    },
  });
  io.on(
    "connection",
    (
      socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ) => {
      socket.on("disconnect", () => {
        socketPMs = socketPMs.filter((item) => item.socketId !== socket.id);
        socketOM = socketOM.filter((item) => item.socketId !== socket.id);
        console.log("client disconnected, ", socket.id);
      });
      socket.on("joined-OM", (data: any) => {
        console.log("joined OM");
        // socketOM = socketOM.filter((item) => item.id !== data._id);
        socketOM.push({
          id: data._id,
          socketId: socket.id,
        });
        console.log("OM connected,", socketOM);
      });
      socket.on("joined-PM", (data: any) => {
        console.log("joined PM");
        // socketPMs = socketPMs.filter((item) => item.id !== data._id);
        socketPMs.push({
          id: data._id,
          socketId: socket.id,
        });
        console.log("PM connected,", socketPMs);
      });
    }
  );
  return io;
}
