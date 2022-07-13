import ClientController from "../../controllers/client";
import { ClientData } from "../../types/model/Client";
import { successMsg } from "../../utils/successMsg";
import { customeError } from "../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import { io } from "../../..";

const ClientReq = class ClientReq extends ClientController {
  static async handleCreateClient(req: Request, res: Response) {
    try {
      let file: { image: { location: string }[] } | any = req.files;
      if (file.image) {
        req.body.image = file.image[0].location;
      }
      let Client = await super.createClient(req.body);
      if (Client) {
        io.sockets.emit("create-client", Client);
        return res.status(200).send(Client);
      } else {
        return res.status(400).send(customeError("create_client_error", 400));
      }
    } catch (error) {
      logger.error({ handleCreateClientDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdateClient(req: Request, res: Response) {
    try {
      let clientData: ClientData = req.body;
      let file: { image: { location: string }[] } | any = req.files;
      if (file.image && file.image[0]) {
        clientData.image = file.image[0].location;
      }
      logger.info({ clientData });
      if (!clientData) {
        return res.status(400).send(customeError("update_client_error", 400));
      }

      let Client = await super.updateClient(clientData);
      if (Client) {
        return res.status(200).send(Client);
      } else {
        return res.status(400).send(customeError("update_client_error", 400));
      }
    } catch (error) {
      logger.error({ handleUpdateClientDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleDeleteClient(req: Request, res: Response) {
    try {
      let id: any = req.query.id;
      if (!id) {
        return res.status(400).send(customeError("delete_client_error", 400));
      }

      let Client = await super.deleteClient(id);
      if (Client) {
        return res.status(200).send(successMsg("delete_client_success", 200));
      } else {
        return res.status(400).send(customeError("delete_client_error", 400));
      }
    } catch (error) {
      logger.error({ handleDeletClientDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetAllClients(req: Request, res: Response) {
    try {
      let Client = await super.getAllClients();
      if (Client) {
        return res.status(200).send(Client);
      } else {
        return res.status(400).send(customeError("get_client_error", 400));
      }
    } catch (error) {
      logger.error({ handleDeletClientDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};

export default ClientReq;
