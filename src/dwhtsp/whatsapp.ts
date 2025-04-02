import path from "path";
import { type Logger } from "pino";
import { logger } from "./utils/loger";
const messageRetryCounterCache = new NodeCache()
import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState, type WASocket, type WAVersion, delay, Browsers } from "baileys";
import NodeCache from "@cacheable/node-cache";
import type { Boom } from "@hapi/boom";
import { existsSync, readdirSync } from "fs";
import qr from "qrcode"
import fse from "fs-extra"
import callback from "./utils/callback";
const sessions = new Map<string, WASocket>()
const retryCount = new Map();
const callbacks = new Map()
class Whatsapp {
    public logger: Logger;
    constructor() {
        this.logger = logger(path.join('log.txt'))
    }
    /**
     * getVersion
     */
    public async getBalleyVersion(): Promise<{
        version: WAVersion,
        isLatest: boolean,
        error: any
    }> {
        const { version, error, isLatest } = await fetchLatestBaileysVersion()
        return {
            version,
            error,
            isLatest
        }
    }
    /**
     * sessionFolder
     */
    public sessionFolder() {
        return path.resolve(path.join(`sessions`))
    }
    /**
     * multipleAuthFile
     */
    public async multipleAuthFile(session_name: string) {
        const session_path = path.join(this.sessionFolder(), session_name);
        const { saveCreds, state } = await useMultiFileAuthState(session_path)
        return {
            saveCreds,
            state
        }
    }

    /**
     * createSocket
     */
    private async createSocket(sessionName: string): Promise<WASocket> {

        const { state, saveCreds } = await this.multipleAuthFile(sessionName)
        const { version, error } = await this.getBalleyVersion()
        if (error) {
            console.error(`Session ${sessionName} failed connection to server. Please check your internet connection`);
        }
        const sock = makeWASocket({
            logger: this.logger,
            version: version,
            browser: Browsers.appropriate("Wgty Engine"),
            printQRInTerminal: false,
            msgRetryCounterCache: messageRetryCounterCache,
            generateHighQualityLinkPreview: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, this.logger)
            }
        })
        sock.ev.on('creds.update', saveCreds)
        return sock;

    }
    /**
     * clearState
     */
    public clearState(name: string) {
        const session = path.join(this.sessionFolder(), name)
        sessions.delete(name);
        if (existsSync(session)) {
            try {
                fse.rmSync(session, {
                    recursive: true,
                    force: true,
                })
                console.log(`Auth Session ${name} deleted successfully`);
            } catch (error) {
                console.log(`Auth Session ${name} deleted failed`);
            }
        }
    }
    /**
     * onQrCode
     */
    public onQrCode(listener: (e: any) => void) {
        callbacks.set(callback.ON_QR, listener);
    }
    /**
     * onMessageRecived
     */
    public onMessageRecived(listener: (e: any) => void) {
        callbacks.set(callback.ON_MESSAGGE_RECIVED, listener)
    }

    /**
     * isSessionAlerdy
     */
    public isSessionAlerdy(session: string) {
        const paht = path.join(this.sessionFolder(), session);
        if (existsSync(paht) && this.getSession(session)) {
            return true;
        }
        return false;

    }

    //ini adalah new session
    public async startSession(name: string): Promise<WASocket | null> {
        console.log(`New session ${name}`);

        const connect = async (): Promise<WASocket> => {
            try {
                let $socket = await this.createSocket(name);
                const { ev } = $socket;
                ev.on("connection.update", async (event) => {
                    var retryCounts = retryCount.get(name) ?? 0;
                    const { connection, lastDisconnect } = event;
                    const Error = lastDisconnect?.error as Boom;
                    if (event.qr) {
                        callbacks.get(callback.ON_QR)?.({
                            qr: await qr.toDataURL(event.qr),
                            session: name
                        })
                    }
                    if (connection == 'open') {
                        console.log(`Whatsapp connected succesfully ${name} Session has ben save to local storage`)
                        //set session
                        sessions.set(name, $socket);
                    }
                    //jika koneksi close coba minimal 10 kali
                    if (connection == 'close') {
                        const shouldRetry = (Error.output.statusCode != DisconnectReason.loggedOut)
                        //coba koneksikan ulang selamat 10 kali
                        if (shouldRetry && retryCounts <= 10) {
                            retryCounts++
                            retryCount.set(name, retryCounts)
                            //reconnecting state
                            console.log(`Reconnecting... Attempt ${retryCounts}/10`);
                            await delay(5000);
                            await connect()
                            //jika gak connect connect
                        } else {
                            console.log(`Max retries reached. Clearing session: ${name}`);
                            this.clearState(name)
                            retryCount.delete(name);
                        }
                    }
                })
                ev.on("messages.upsert", (msg) => {
                    callbacks.get(callback.ON_MESSAGGE_RECIVED)?.({
                        session: name,
                        messages: msg.messages
                    })
                })
                return $socket;
            } catch (error) {
                console.log(`WA: Error New Socket: ${error}`);
                return Promise.reject(`Opps:${error}`)
            }
        }
        if (this.isSessionAlerdy(name)) {
            console.log("Session Alerdy!");
            return null;
        }
        return await connect();
    }
    /**
     * loadSessionFromStorage
     */
    public async loadSessionFromStorage() {
        const dir = this.sessionFolder()
        if (existsSync(dir)) {
            const sessions = readdirSync(dir);
            sessions.forEach(session => {
                this.startSession(session).then(e => {
                    console.log(`WA: ${session} Loaded`);
                }).catch(() => {
                    console.log(`WA: Error ${session}`);
                })
            })
        }
    }
    /**
     * getClients
     */
    public getAllSessions() {
        if (existsSync(this.sessionFolder())) {
            return readdirSync(this.sessionFolder())
        }
    }

    /**
     * name
     */
    public getSession(name: string) {
        return sessions.get(name);
    }
}
export default Whatsapp;