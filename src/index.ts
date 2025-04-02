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
import ioHandler from "./controllers/io-handler"
import { ioMiddleware } from "./middleware/auth"
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
    app.use(logger({ level: "silent" }))
    app.use(cors())
    app.use(bodyParser.json())
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader("x-powered-by", config.ServerName)
        next()
    })
    app.get('/qrcode', (req, res) => {
        res.sendFile(join(__dirname, "index.html"));
    })
    //create server
    const server = createServer(app)
    const io = new Server(server)
    //secure socket
    io.use(ioMiddleware())
    io.on('connection', ioHandler)
    app.use(route);
    server.listen(PORT, () => {
        console.log("HTTP: Server run at port: " + PORT);
    })
    //load session from storage
    whatsapp.wa.loadSessionFromStorage()
}