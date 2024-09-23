import express from "express";
import connectToDB from "./server/DB/mongo-db.js";
import authRouters from "./server/routes/authRoutes.js";
import cors from "cors";
import contactRouter from "./server/routes/contactsRoutes.js";
import cookieParser from "cookie-parser";

const app = express();
await connectToDB();
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

app.use("/auth", authRouters);
app.use("/list", contactRouter);

const port = 3000;

app.listen(port, () => {
  console.log(`${Date().toString()}--Server is running on port: ${port}`);
});
