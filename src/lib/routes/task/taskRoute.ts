import {Router} from 'express'
import TaskReq from '../../presentation/task/task'
import apiRoute from './apis'
import multer from "multer";

let upload = multer()

const router = Router()
const {CREATE_TASK,UPDATE_TASK,WEBHOOK_UPDATES} = apiRoute
const {handleCreateCard,handleUpdateCard,handleWebhookUpdateCard} = TaskReq


router.post(`${CREATE_TASK}`,upload.single('file'),handleCreateCard)
router.post(`${UPDATE_TASK}`,upload.single('file'),handleUpdateCard)
router.post(`${WEBHOOK_UPDATES}`,handleWebhookUpdateCard)
router.get(`${WEBHOOK_UPDATES}`,handleWebhookUpdateCard)


export default router