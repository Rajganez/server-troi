import { Router } from "express";
import { loginIn, logOut, register } from "../controllers/authController.js";

const authRouters = Router();

authRouters.post("/register", register);
authRouters.post("/login", loginIn);
authRouters.post("/logout", logOut);

export default authRouters;
