import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//Middleware configuration
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(404).send({ msg: "Not authorized" });
  }
  //Verify jwt token in the cookie
  jwt.verify(token, process.env.JWT_KEY, async (err, result) => {
    if (err) {
      return res.status(403).send({ msg: "Token not valid or Expired!" });
    }
    req.Id = result.Id;
    next();
  });
};
