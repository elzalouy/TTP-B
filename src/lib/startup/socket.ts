import config from "config";
import _ from "lodash";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
export let socketClients: any[] = [];
export let socketOM: any[] = [];
export default function appSocket(http: any) {
  const io = new Server(http, {
    path: "/socket.io",
    cors: {
      origin: config.get("FrontEndUrl"),
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
        socketClients = socketClients.filter(
          (item) => item.socketId !== socket.id
        );
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
        // socketClients = socketClients.filter((item) => item.id !== data._id);
        socketClients.push({
          id: data._id,
          socketId: socket.id,
        });
        console.log("PM connected,", socketClients);
      });
    }
  );
  return io;
}
