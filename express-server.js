import express from "express";
import connectToDB from "./server/DB/mongo-db.js";
import dotenv from "dotenv";
import authRouters from "./server/routes/authRoutes.js";
import cors from "cors";
import fs from "fs";
import contactRouter from "./server/routes/contactsRoutes.js";
import cookieParser from "cookie-parser";
import emailRouters from "./server/routes/emailRoutes.js";
import messageRouters from "./server/routes/messageRoutes.js";
import testimonialRouter from "./server/routes/testimonialRouter.js";
import demoRouter from "./server/routes/demoRouter.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const createDirectories = () => {
  const directories = ["/tmp/uploads/files"];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Function to create directories for Render Instances
createDirectories();

const app = express();
await connectToDB();

app.use(cookieParser());

app.use(
  cors({
    origin: ["https://trueroi.netlify.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads/files",
  express.static(path.join("/tmp", "uploads", "files"))
);

app.use(express.json());

app.use("/auth", authRouters);
app.use("/list", contactRouter);
app.use("/email", emailRouters);
app.use("/message", messageRouters);
app.use("/testimonial", testimonialRouter);
app.use("/demo", demoRouter);

const port = 3000;

app.listen(port, () => {
  console.log(`${Date().toString()}--Server is running on port: ${port}`);
});
