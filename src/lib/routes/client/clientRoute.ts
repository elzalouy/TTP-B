import apis from "./apis";
import { Router } from "express";
import ClientReq from "../../presentation/client/client";
import { imageUpload } from "../../services/awsS3";

const router = Router();

let clientImage = imageUpload.fields([{ name: "image", maxCount: 1 }]);

const {
  GET_CLIENT,
  GET_ALL_CLIENTS,
  CREATE_CLIENT,
  DELETE_CLIENT,
  UPDATE_CLIENT,
} = apis;

const {
  handleCreateClient,
  handleDeleteClient,
  handleUpdateClient,
  handleGetAllClients,
} = ClientReq;

router.post(`${CREATE_CLIENT}`, clientImage, handleCreateClient);
router.put(`${UPDATE_CLIENT}`, clientImage, handleUpdateClient);
router.delete(`${DELETE_CLIENT}`, handleDeleteClient);
router.get(`${GET_ALL_CLIENTS}`, handleGetAllClients);

export default router;
