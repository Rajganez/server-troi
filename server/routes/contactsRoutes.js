import { Router } from "express";
import {
  addContact,
  showList,
  uploadFile,
  editSingleData,
  deleteSingleData,
} from "../controllers/contactsController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import multer from "multer";
import path from "path"; // To help handle file extensions

const contactRouter = Router();

// Multer storage configuration with customized filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/files"); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    // Save the file with a timestamp and the original name
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize multer with the customized storage configuration
const upload = multer({ storage: storage });

// Routes
contactRouter.post("/add", verifyToken, addContact);
contactRouter.post("/show", verifyToken, showList);
contactRouter.post(
  "/file-upload",
  upload.single("file"),
  verifyToken,
  uploadFile
);
contactRouter.post("/edit", verifyToken, editSingleData);
contactRouter.post("/delete", verifyToken, deleteSingleData);


export default contactRouter;
