import ClientDB from "../dbCalls/client/client";
import { Client, ClientData } from "./../types/model/Client";
import logger from "../../logger";

const ClientController = class ClientController extends ClientDB {
  static async createClient(data: ClientData) {
    return await ClientController.__createClient(data);
  }

  static async updateClient(data: ClientData) {
    return await ClientController.__updateClient(data);
  }

  static async getAllClients() {
    return await ClientController.__getAllClients();
  }
  static async deleteClient(id: string) {
    return await ClientController.__deleteClient(id);
  }
  static async updateCleintProcedure(id: any) {
    return await ClientController.__updateClientProcedure(id);
  }

  static async __deleteClient(id: string) {
    try {
      let client = await super.deleteClientDB(id);
      return client;
    } catch (error) {
      logger.error({ deletClientControllerError: error });
    }
  }

  static async __getAllClients() {
    try {
      let client = await super.getAllClientsDB();
      return client;
    } catch (error) {
      logger.error({ getClientControllerError: error });
    }
  }

  static async __updateClient(data: ClientData) {
    try {
      let client = await super.updateClientDB(data);
      return client;
    } catch (error) {
      logger.error({ updateClientControllerError: error });
    }
  }

  static async __createClient(data: ClientData) {
    try {
      let client = super.createClientDB(data);
      return client;
    } catch (error) {
      logger.error({ createClientError: error });
    }
  }
  static async __updateClientProcedure(_id: any) {
    try {
      return await super.updateClientProcedure(_id);
    } catch (error) {
      logger.error({ updateClientProcedure: error });
    }
  }
};

export default ClientController;
