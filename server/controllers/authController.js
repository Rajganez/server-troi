import { db } from "../DB/mongo-db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { mailOptions, transporter } from "./emailControllers.js";

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
      return res.status(200).json({ userId: user._id });
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
};

//-----------Get User Function----------------//

export const getUser = async (req, res) => {
  const { userId } = req.body;
  try {
    const objectId = ObjectId.createFromHexString(userId);
    const user = await authCollection.findOne({ _id: objectId });
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    return res.status(200).json({ userName: user.username });
  } catch (error) {
    return res.status(500).send({ msg: "Server Error" });
  }
};

//--------Mail Content for Password reset---//

const htmlContent = (resetURL, userName) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f6f8fa;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        h1 {
            color: #f65b07;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            color: #fff;
            background-color: #f65b07;
            border-radius: 5px;
            text-decoration: none;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            text-align: center;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset Request</h1>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password. Below your Password Reset Link</p>
        <a href="${resetURL}" style="color: blue; text-decoration: underline;">Click here to reset your password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you!</p>
        <div class="footer">
            <p>Best Regards,<br />TrueROI Team</p>
        </div>
    </div>
</body>
</html>
`;

//------------Forgot Password----------------//

export const forgotPassword = async (req, res) => {
  const { mailId } = req.body;
  try {
    const user = await authCollection.findOne({ email: mailId });
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    } else {
      // Generate a password reset token or link here
      const resetToken = user._id.toString();
      // Construct the reset URL
      const resetURL = `http:/localhost:5173/reset-password/${resetToken}`;

      await transporter.sendMail({
        ...mailOptions,
        to: mailId,
        subject: "TrueROI Password Reset Link",
        html: htmlContent(resetURL, user.username), // Call the function to generate HTML content
      });

      return res.status(200).send({ msg: "Password reset link sent!" });
    }
  } catch (error) {
    return res.status(500).send({ msg: "Server error", error });
  }
};

//-------------Reset Password----------------//

export const resetPassword = async (req, res) => { 
  const {userId , password} = req.body;
  try {
    const objectId = ObjectId.createFromHexString(userId.id);
    const user = await authCollection.findOne({_id : objectId});
    if(!user){
      return res.status(404).send({msg : "User not found or link tampered"});
    }else{
      const hashedPassword = await bcrypt.hash(password, 10);
      await authCollection.updateOne(
        { _id: objectId },
        { $set: { password: hashedPassword, confirmPassword: hashedPassword } }
      );
      return res.status(200).send({ msg: "Password reset successfully" });
    }
  } catch (error) {
    return res.status(500).send({ msg: "Server error", error});
  }
}