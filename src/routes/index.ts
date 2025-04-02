import express from "express";
import * as sessionController from "../controllers/session-controller"
import { auth } from "../middleware/auth";
import serverKeyMiddleware from "@/middleware/server-key-middleware";
const route = express.Router()
route.use(serverKeyMiddleware())
route.post('/session/start', sessionController.newSession)
route.get('/session/msg', sessionController.addDevice)
route.get('/session/all', sessionController.getAllSessions)
export default route;