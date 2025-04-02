import { Request, Response } from "express";
import * as whatsapp from "../dwhtsp";
import { randomUUID } from "node:crypto";
import { sendImage, sendText } from "@/dwhtsp/messaging";
import qrc from "qrcode"
const newSession = async (req: Request, res: Response) => {
    console.log(res.locals.session);

    const session_name = req.body?.session;
    if (!session_name) {
        res.json("Invalid session name body");
    }

    try {
        const wa = await whatsapp.wa.startSession(session_name);
        wa.ev.on('connection.update', async e => {
            if (!res.headersSent && e.qr) {
                res.status(201).end(`<img src='${await qrc.toDataURL(e.qr)}'/>`)
            }
        })
    } catch (e: any) {
        res.end(e.message)
    }

}
const getAllSessions = (req: Request, res: Response) => {
    res.json(whatsapp.wa.getAllSessions())
}
const addDevice = async (req: Request, res: Response) => {
    res.json([])
}
export {
    getAllSessions,
    addDevice,
    newSession
}