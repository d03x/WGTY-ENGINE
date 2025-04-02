import { Socket } from "socket.io";
import * as whatsapp from "@dwhtsp/index"
import qrcode from "qrcode"
function connectionHandler(
    client: Socket,
    session: string
) {
    return async (e: any) => {
        console.log(e.connection);

        if (e.qr) {
            client.emit('d-server', {
                type: "qr200",
                qrcode: await qrcode.toDataURL(e.qr),
                session: session
            })
        }
    }
}

export default function (client: Socket) {
    client.on('logout', async (session) => {
        whatsapp.wa.clearState(session);
    })
    client.on("start-session", async session => {
        //start sesion
        let was = await whatsapp.wa.startSession(session);
        if (was?.ev) {
            was.ev.on("connection.update", connectionHandler(client, session))
        }
    })
}