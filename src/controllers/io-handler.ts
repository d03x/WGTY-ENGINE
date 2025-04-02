import { Socket } from "socket.io";
import * as whatsapp from "@dwhtsp/index"
export default function (client: Socket) {
    client.on('logout', async (token) => {
        whatsapp.wa.clearState(token);
    })
    client.on("get-session", async token => {
        //start sesion
        let was = await whatsapp.wa.startSession(token);
        let logs = new Set
        let qrEqpired = false;
        whatsapp.wa.onQrCode((e) => {
            if (e.session === token) {
                if (qrEqpired) return;
                logs.add(e.qr)
                if (logs.size <= 5) {
                    client.emit('logs', logs.size);
                    client.emit('qrcode', e)
                } else {
                    was?.logout()
                    qrEqpired = true;
                    logs.clear()
                    whatsapp.wa.clearState(token)
                    client.emit('qr-expired', "Expired")
                }
            }

        })

    })
}