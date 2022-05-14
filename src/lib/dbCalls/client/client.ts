import Clients from "../../models/Client";
import logger from "../../../logger";
import { Client, ClientData } from "../../types/model/Client";
import Project from "../../models/Project";

const ClientDB = class ClientDB {
  static async createClientDB(data: ClientData) {
    return await ClientDB.__createClient(data);
  }

  static async updateClientDB(data: ClientData) {
    return await ClientDB.__updateClient(data);
  }

  static async getAllClientsDB() {
    return await ClientDB.__getAllClients();
  }
  static async deleteClientDB(id: string) {
    return await ClientDB.__deleteClient(id);
  }
  static async updateClientProcedure(id: any) {
    return await ClientDB.__updateClientProcedureDB(id);
  }
  static async __deleteClient(id: string) {
    try {
      let client = await Clients.findByIdAndDelete({ _id: id });
      return client;
    } catch (error) {
      logger.error({ deletclientDBError: error });
    }
  }

  static async __getAllClients() {
    try {
      let client = await Clients.find().lean();
      return client;
    } catch (error) {
      logger.error({ getclientDBError: error });
    }
  }

  static async __updateClient(data: ClientData) {
    try {
      let id = data._id;
      delete data._id;
      let client = await Clients.findByIdAndUpdate(
        { _id: id },
        { ...data },
        { new: true }
      );
      return client;
    } catch (error) {
      logger.error({ updateClientDBError: error });
    }
  }

  static async __createClient(data: ClientData) {
    try {
      let client: Client = new Clients(data);
      await client.save();
      return client;
    } catch (error) {
      logger.error({ createclientDBError: error });
    }
  }
  static async __updateClientProcedureDB(id: any) {
    try {
      let client = await Clients.findById(id);
      console.log(client);
      if (client) {
        let projects = await Project.find({ clientId: id }).lean();
        if (projects) {
          let inProgress = projects.filter(
            (item) => item.projectStatus === "inProgress"
          ).length;
          let done = projects.filter(
            (item) =>
              item.projectStatus === "deliver before deadline" ||
              item.projectStatus === "deliver on time" ||
              item.projectStatus === "delivered after deadline"
          ).length;
          client.inProgressProject = inProgress;
          client.doneProject = done;
          return await client.save();
        }
        return null;
      }
      return null;
    } catch (error) {
      logger.error({ updateClientProcedureError: error });
    }
  }
};

export default ClientDB;
