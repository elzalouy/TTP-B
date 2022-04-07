import Clients from "../../models/Client";
import logger from "../../../logger";
import { Client, ClientData } from "../../types/model/Client";

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
      let id = data.id;
      delete data.id;
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
};

export default ClientDB;
