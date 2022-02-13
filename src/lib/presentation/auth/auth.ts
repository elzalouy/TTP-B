import { AuthSignIn, UpdatePassword } from './../../types/controller/auth';
import { successMsg } from './../../utils/successMsg';
import {Request, Response } from "express";
import logger from "../../../logger";
import { customeError } from "../../utils/errorUtils";
import AuthController from '../../controllers/auth';

const AuthReq = class AuthReq extends AuthController  {
    static async handleSignInUser(req:Request,res:Response){
        try {
            let userData:AuthSignIn = req.body
            if(userData){
                 let user = await super.signInUser(userData)
                 if(user.userData){
                     const {token,userData} = user
                     res.cookie('token',`Bearer ${token}`,{
                        httpOnly: true,
                        // maxAge:24 * 60 * 60,
                        secure: process.env.NODE_ENV === 'development'? false: true
                     })
                     return res.status(200).send(userData)
                 }else {
                    return res.status(400).send(customeError('credential_error',400))
                 }
            } else {
                return res.status(400).send(customeError('credential_error',400))
            }
        } catch (error) {
            logger.error({handleSignInUserError:error})
            return res.status(500).send(customeError('server_error',500))
        }
    }

    static async handleLogoutUser(req:Request,res:Response){
        try {
            res.clearCookie('token')
            return res.status(200).send()
        } catch (error) {
            logger.error({handleLogoutUserError:error})
            return res.status(500).send(customeError('server_error',500))
        }
    }

    static async handleUserForgetPassword(req:Request,res:Response){
        try {
            let userData:string = req.body.email
            if(userData){
                 let user = await super.forgetUserPassword(userData)
                 if(user.status === 200){
                     return res.status(200).send(user)
                 }else {
                    return res.status(400).send(user)
                 }
            } else {
                return res.status(400).send(customeError('credential_error',400))
            }
        } catch (error) {
            logger.error({handleUserForgetPasswordError:error})
            return res.status(500).send(customeError('server_error',500))
        }
    }

    static async handleUpdateUserPassword(req:Request,res:Response){
        try {
            let userData:UpdatePassword = req.body
            if(userData){
                const {token,password} = userData
                 let user = await super.setNewPassword(token,password)
                 if(user.status === 200){
                     return res.status(200).send(user)
                 }else {
                    return res.status(400).send(user)
                 }
            } else {
                return res.status(400).send(customeError('credential_error',400))
            }
        } catch (error) {
            logger.error({handleUpdateUserPasswordError:error})
            return res.status(500).send(customeError('server_error',500))
        }
    }
}

export default AuthReq