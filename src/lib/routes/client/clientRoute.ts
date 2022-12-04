import apis from "./apis";
import { Router } from "express";
import ClientReq from "../../presentation/client/client";
import { imageUpload } from "../../services/awsS3";
import Authed from "../../middlewares/Auth/Authed";
import OMOrSM from "../../middlewares/Auth/OMOrSM";

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

router.post(
  `${CREATE_CLIENT}`,
  Authed,
  OMOrSM,
  clientImage,
  handleCreateClient
);
router.put(`${UPDATE_CLIENT}`, Authed, OMOrSM, clientImage, handleUpdateClient);
router.delete(`${DELETE_CLIENT}`, Authed, OMOrSM, handleDeleteClient);
router.get(`${GET_ALL_CLIENTS}`, Authed, handleGetAllClients);

export default router;
