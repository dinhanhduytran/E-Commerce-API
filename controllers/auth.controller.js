import bcrypt from "bcryptjs";
import Joi from "joi";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../middlewares/auth.js";
import { HttpError } from "../utils/httpErrors.js";


const credentialsSchema = Joi.object({
    username: Joi.string().min(6).max(20).required(),
    password: Joi.string().min(8).max(20).required(),
    email: Joi.string().email().required()
})

export const register = async (req, res, next) => {
    try {
        console.log(req.body)
        const { value, error } = credentialsSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error })

        const { username, password, email } = value;

        // Check if user already exists
        const existed = await User.findOne({ username });
        if (existed) return res.status(400).json({ error: "Username already exists" });

        // Check if email already exists
        const emailExisted = await User.findOne({ email });
        if (emailExisted) return res.status(400).json({ error: "Email already exists" });


        // Create new user
        const user = new User({
            username,
            password,
            email
        })
        await user.save();

        const access = signAccessToken(user);
        const refresh = signRefreshToken(user);

        res
            .cookie('refreshToken', refresh, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 })
            .status(201).json({ token: access, user: { id: user._id, email, username } })
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.error("Registration error:", error);
    }
}

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "Invalid username or password" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid username or password" });

        // Generate access token
        const access = signAccessToken(user);
        const refresh = signRefreshToken(user)
        res
            .cookie('refreshToken', refresh, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 })
            .status(201)
            .json({
                token: access,
                user: {
                    id: user._id,
                    email: user.email,
                    username
                }
            })

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.error("Login error:", error);
    }
}


import jwt from "jsonwebtoken";
export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return next(new HttpError(401, "Refresh token is required"));
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new HttpError(401, "Invalid refresh token"));
        }
        const accessToken = signAccessToken(user);
        res.json({ token: accessToken })


    } catch (error) {
        next(new HttpError(401, "Invalid refresh token"));
        console.error("Refresh token error:", error);
    }
}

export const me = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json({
            user
        });
        console.log(user)
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.error("Get user error:", error);
    }
}

export const logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshToken').json({ ok: true, message: "Logged out successfully" });

    } catch (error) {

    }
}
