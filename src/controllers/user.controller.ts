import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import sessionService from "../services/session.service";
import { ResponseSend } from "../utils/response";
import { HTTP_STATUS } from "../constants/app.constant";




export const getUserSessions  = asyncHandler(async (req: Request, res: Response) => { 
    const userId = req.user._id

    const sessions = await sessionService.getUserSessions(userId)

    // console.log(sessions)

    return ResponseSend.success(
        res,
        "Sessions retrieved successfully.",
        sessions,
        HTTP_STATUS.OK
    )

 })
