import { Router } from "express";
import {
  getEmailCampaignDetails,
  sendEmail,
  unsubscribeEmail,
} from "../controllers/emailControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";

const emailRouters = Router();

emailRouters.post("/send-email", verifyToken, sendEmail);
emailRouters.post("/get-email-campaign", verifyToken, getEmailCampaignDetails);
emailRouters.post("/unsubscribe-email", verifyToken, unsubscribeEmail);

export default emailRouters;
