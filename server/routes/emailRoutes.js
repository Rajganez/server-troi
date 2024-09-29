import { Router } from "express";
import {
  getEmailCampaignDetails,
  sendEmail,
} from "../controllers/emailControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";

const emailRouters = Router();

emailRouters.post("/send-email", verifyToken, sendEmail);
emailRouters.post("/get-email-campaign", verifyToken, getEmailCampaignDetails);

export default emailRouters;
