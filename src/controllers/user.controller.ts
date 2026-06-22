

import {NextFunction, Request, Response, } from "express"
import { forgetPassword, resetPassword } from "../services/user.service"


export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => { 
    
    try {

        const {token, id} = req.query as {token: string, id: string}
        const {newPassword} = req.body as {newPassword: string}
        const result = await resetPassword(newPassword, token, id)

        res.status(200).json({
            result
        })
        
    } catch (error) {
        next(error)
    }

 }


 export const forgetuserPassword = async (req: Request, res: Response, next: NextFunction) => { 
    
    try {

        const {email} = req.body as {email: string}
        const result = await forgetPassword(email)

        res.status(200).json({
            result
        })
        
    } catch (error) {
        next(error)
    }

 }
