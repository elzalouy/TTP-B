import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
let clients = 0;
function appSocket(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  let soc = io.on(
    "connection",
    (
      socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ) => {
      console.log("new client connected No.", ++clients);
      socket.on("disconnect", () =>
        console.log("Client disconnected No,", --clients)
      );
      console.log("listening to move task, ", io.listeners("Move Task"));
      //* this for admins role only
      socket.on("joined admin", () => {
        // logger.info({ data });
        return socket.join("admin room");
      });
      //* this for project managers role only
      socket.on("joined manager", () => {
        // logger.info({ data });
        return socket.join("manager room");
      });
      //* this is for specific user
      socket.on("joined user", (data: any) => {
        return socket.join(`user-${data.id}`);
      });
    }
  );
}
export default appSocket;
