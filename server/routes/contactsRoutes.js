import { Router } from "express";
import { addContact } from "../controllers/contactsController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const contactRouter = Router();

contactRouter.post("/add", verifyToken, addContact);

export default contactRouter;
