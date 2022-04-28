import {Router} from 'express'
import UserReq from '../../presentation/users/users'
import apiRoute from './apis'


const router = Router()
const {CREATE_USER,UPDATE_USER,UPDATE_PASSWORD,DELETE_USER,GET_USERS,GET_USER} = apiRoute
const {handleCreatUser,handleUpdateUser,handleUpdatePassword,handleDeleteUser,handleGetUserPmOrSA,handleGetUserInfo} = UserReq


router.post(`${CREATE_USER}`,handleCreatUser)
router.post(`${UPDATE_USER}`,handleUpdateUser)
router.put(`${UPDATE_PASSWORD}`,handleUpdatePassword)
router.delete(`${DELETE_USER}`,handleDeleteUser)
router.get(`${GET_USERS}`,handleGetUserPmOrSA)
router.get(`${GET_USER}`,handleGetUserInfo)


export default router