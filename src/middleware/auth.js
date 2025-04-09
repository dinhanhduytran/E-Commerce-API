import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to check if user is authenticated
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    // verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user
    // decoded include id and isAdmin
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Token invalid, access denied" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication Error", error);
    res.status(401).json({ message: "Authentication Error" });
  }
};

export default auth;
