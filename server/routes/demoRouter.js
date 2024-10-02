import { Router } from "express";
import { updateDemoLead } from "../controllers/demoController.js";

const demoRouter = Router();

demoRouter.post("/demo-details", updateDemoLead);

export default demoRouter;
