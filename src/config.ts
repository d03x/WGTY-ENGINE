import dotenv from "dotenv"
dotenv.config()
export default {
    PORT: process.env.PORT || 3000,
    DB_FILE: process.env.DB_FILE,
    SERVER_TOKEN: process.env.SERVER_TOKEN,
    ServerName: process.env.SERVER_NAME || 'Express',
    whitelist_ip: process.env.WHITE_LIST_IP || 'localhost'
}