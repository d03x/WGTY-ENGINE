import config from "@/config";
import { NextFunction, Request, Response } from "express";

export default function serverKeyMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
        const authorization = req.headers['authorization'] as string;
        const key = authorization?.split(" ");

        if (!authorization || key?.length > 2) {
            res.status(401).json({
                status: false,
                message: "Invalid authorization code"
            })
            return;
        }

        if (key[1] !== config.SERVER_TOKEN) {
            res.status(401).json({
                status: false,
                message: "Authorization code is invalid"
            })
            return;
        }


        next()


    }
}