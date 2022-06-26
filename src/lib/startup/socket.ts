import config from "config";
import _ from "lodash";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
export default function appSocket(http: any) {
  let clients: any[] = [];
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
      clients.push(socket.id);
      clients = _.uniq(clients);
      console.log("client connected, ", socket.id);
      console.log("no of clients,", clients.length);
      socket.on("disconnect", () => {
        clients = clients.filter((item) => item !== socket.id);
        console.log("client disconnected, ", socket.id);
        console.log("no of clients,", clients.length);
      });
      socket.on("joined-admin", () => {
        console.log("joined-admin");
        return socket.join("admin-room");
      });
      socket.on("joined-manager", () => {
        console.log("joined-manager");
        return socket.join("manager-room");
      });
      socket.on("joined-user", (data: any) => {
        if (data.id) {
          console.log(`user-${data.id}`);
          return socket.join(`user-${data.id}`);
        }
      });
    }
  );
  return io;
}
