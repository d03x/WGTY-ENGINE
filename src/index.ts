import express, { NextFunction, Request, Response } from "express"
import cors from 'cors'
import { TConfig } from "@/types/config"
import { createServer } from "node:http"
import route from "@/routes"
import { Server, Socket } from "socket.io"
import { join } from "node:path"
import * as whatsapp from "@dwhtsp/index"
import logger from "pino-http"
import bodyParser from "body-parser"
/**
 * file ini adalah bagian dari wagaty api
 * @copyright 2025
 * @description entrypoint application api
 * @param config 
 * @returns void
 * @author dadanhidyt <dadanhidyt@gmail.com>
 */
export function InitApp(config: TConfig) {
    const PORT = config.PORT || process.env.PORT
    //build express
    const app = express()
    app.use(logger())
    app.use(cors())
    app.use(bodyParser.json())
    app.get('/qrcode', (req, res) => {
        res.sendFile(join(__dirname, "index.html"));
    })
    //create server
    const server = createServer(app)
    const io = new Server(server)
    //secure socket
    io.use((req, next) => {
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


    })
    io.on('connection', (e) => {
        //if on connected 
        whatsapp.wa.onQrCode((e) => {
            io.emit('qrcode', e)
        })
    })
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader("x-powered-by", config.ServerName)
        next()
    })
    app.use(route);
    server.listen(PORT, () => {
        console.log("HTTP: Server run at port: " + PORT);
    })


    whatsapp.wa.loadSessionFromStorage()

}