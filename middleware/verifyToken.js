import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  // const token = req.cookies?.token;

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     const user = await User.findById(decoded.userId);

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });

    // req.userId = decoded.userId;
    req.user = user;
    // console.log("reqq", req.user);
    next();
  } catch (error) {
    console.log("Error in verifyToken ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
