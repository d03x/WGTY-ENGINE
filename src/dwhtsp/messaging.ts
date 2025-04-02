import { jidNormalizedUser } from "baileys";
import { wa } from "."
type SendTextType = {
    to: string,
    text: string,
}

const toJID = (to: string) => {
    return jidNormalizedUser(`${to}@s.whatsapp.net`);
}
type SendImageType = {
    image: string,
    to: string,
    caption: string,
}
const sendImage = (session_id: string, options: SendImageType) => {
    const session = wa.getSession(session_id);
    if (session) {
        session.sendMessage(toJID(options.to), {
            image: typeof options.image === 'string' ? {
                url: options.image
            } : options.image,
            caption: options.caption
        })
    }
}

const onReciveMessage = (session: string, callback: (msg: any) => void) => {
    const sessio = wa.getSession(session);
    sessio?.ev.on('messages.upsert', (e) => {
        e.messages.forEach((e) => callback(e))
    })
}

const sendText = (session_id: string, options: SendTextType) => {
    const session = wa.getSession(session_id);
    if (session) {
        session.sendMessage(toJID(options.to), {
            text: options.text,
        })
    }
}

export {
    onReciveMessage,
    sendImage,
    sendText
}