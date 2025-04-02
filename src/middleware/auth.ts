import { NextFunction, Request, Response } from "express"

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