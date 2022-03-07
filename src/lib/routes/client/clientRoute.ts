import apis from './apis';
import { Router } from 'express';
import ClientReq from '../../presentation/client/client';

const router = Router();
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

router.post(`${CREATE_CLIENT}`, handleCreateClient);
router.put(`${UPDATE_CLIENT}`, handleUpdateClient);
router.delete(`${DELETE_CLIENT}`, handleDeleteClient);
router.get(`${GET_ALL_CLIENTS}`, handleGetAllClients);

export default router;
