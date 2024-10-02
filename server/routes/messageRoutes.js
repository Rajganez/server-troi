import { Router } from "express";
import { sendSMS } from "../controllers/messageController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const messageRouters = Router();

messageRouters.post("/get-sms-campaign", verifyToken, sendSMS);

export default messageRouters;
