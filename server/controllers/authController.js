import { db } from "../DB/mongo-db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

export const authCollection = db.collection("User");

const createToken = (email, userId) => {
  return jwt.sign({ mail: email, Id: userId }, process.env.JWT_KEY, {
    expiresIn: "3d",
  });
};
const cookieOptions = {
  httpOnly: true,
  secure: "production",
  sameSite: "None",
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
};

//-----------Register Function-----------------//

export const register = async (req, res) => {
  const payload = req.body;
  const pass = req.body.password;
  try {
    const user = await authCollection.findOne({ email: payload.email });
    if (user) {
      return res.status(409).send({ msg: "Already registered Please Login" });
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    const tempUser = {
      ...payload,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    };
    const data = await authCollection.insertOne({ ...tempUser });
    res.cookie("jwt", createToken(data.email, data._id), cookieOptions);
    return res.status(200).json({ mailID: data.email });
  } catch (error) {
    return res.status(500).send({ msg: "Server Error" });
  }
};

//-----------Login Function--------------------//

export const loginIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authCollection.findOne({ email: email });
    if (!user) {
      return res.status(400).send({ msg: "Enter Valid Email ID" });
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (checkPassword) {
      res.cookie("jwt", createToken(user.email, user._id), cookieOptions);
      return res.status(200).json({ userId : user._id });
    } else {
      return res.status(401).send({ msg: "Enter Valid Password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Server Error" });
  }
};

//-----------Logout Function-------------------//

export const logOut = async (req, res) => { 
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ msg: "Logged Out" });  
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Server Error" });
  }
}

