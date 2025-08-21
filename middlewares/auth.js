import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpErrors.js";
import User from "../models/User.js";

const signAccessToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });
}

// This middleware checks if the user is authenticated by verifying the JWT token
const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new HttpError(400, "Access token is required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new HttpError(400, "Invalid access token"));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return next(new HttpError(400, "Invalid access token"));
    }
}

const signRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, {
        expiresIn: "7d"
    })
}

export { signAccessToken, requireAuth, signRefreshToken }