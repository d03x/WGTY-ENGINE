import { Server, Socket } from "socket.io";

declare global {
    namespace Express {
        //tiap request harus disertakan dengan device id
        export interface Request {
            client?: any,
        }
        export interface Locals {
            session: string
        }
    }
}

export { }