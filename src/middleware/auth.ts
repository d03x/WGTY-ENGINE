import config from "@/config";
import { NextFunction, Request, Response } from "express"
import { Socket } from "socket.io";
export const ioMiddleware = () => {
    return (req: Socket, next: any) => {
        const authorization = req.request.headers['authorization'];
        if (!authorization) {
            console.log("IO:Invalid credential");
        }
        const whitelist = config.whitelist_ip.split(",");
        if (!whitelist.includes(req.handshake.address)) {
            console.log("IO:Unaccess failed");
            req.disconnect()
        } else {
            const key = authorization?.split(" ");
            if (key && key[1] === config.SERVER_TOKEN) {
                console.log(`IO: ${req.id} Connected`);
                return next()
            }
            console.log(`IO: ${req.id} Disconnected`);
            req.disconnect()
        }
    }
}
export const auth = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        //cek by header
        const server_token = req.headers['x-server-token'];
        if (!server_token) {
            res.json({
                status: false,
                message: "Invalid server token"
            })
        }
        const session_id = req.query.session_id;
        if (session_id) {
            console.log(session_id);
        }

        //validate device token

        res.locals.session = req?.body?.session;
        next()
    }
}