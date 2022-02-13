import {Router} from 'express'
import ProjectReq from '../../presentation/project/project'
import apiRoute from './apis'


const router = Router()
const {CREATE_PROJECT,UPDATE_PROJECT,GET_PROJECT,DELETE_PROJECT} = apiRoute
const {handleCreateProject,handleUpdateProject,handleGetProject,handleDeleteProject} = ProjectReq


router.post(`${CREATE_PROJECT}`,handleCreateProject)
router.put(`${UPDATE_PROJECT}`,handleUpdateProject)
router.get(`${GET_PROJECT}`,handleGetProject) 
router.delete(`${DELETE_PROJECT}`,handleDeleteProject) 

export default router