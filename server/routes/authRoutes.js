import { Router } from "express";
import {
  forgotPassword,
  getUser,
  loginIn,
  logOut,
  register,
  resetPassword,
} from "../controllers/authController.js";

const authRouters = Router();

authRouters.post("/register", register);
authRouters.post("/login", loginIn);
authRouters.post("/logout", logOut);
authRouters.post("/get-user", getUser);
authRouters.post("/forgot-user", forgotPassword);
authRouters.post("/password-reset", resetPassword);

export default authRouters;
