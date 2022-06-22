import config from "config";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
export default function appSocket(http: any) {
  let clients = 0;
  const io = new Server(http, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: "*",
      allowedHeaders: ["Content-type"],
    },
  });
  io.on("connect", (socket) => {
    console.log("id", socket.id);
  });
  let soc = io.on(
    "connect",
    (
      socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ) => {
      // console.log("listening to move task, ", io.listeners("Move Task"));
      // socket.on("joined admin", () => {
      //   return socket.join("admin room");
      // });
      // socket.on("joined manager", () => {
      //   return socket.join("manager room");
      // });
      // socket.on("joined user", (data: any) => {
      //   return socket.join(`user-${data.id}`);
      // });
    }
  );
  console.log(soc.allSockets());
  return soc;
}
