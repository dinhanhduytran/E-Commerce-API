import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if user already exists
    const userAlreadyExists = await User.findOne({ username });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (username.length < 6 || username.length > 12) {
      return res
        .status(400)
        .json({ message: "Username must be between 6 and 12 characters" });
    }

    // check if password is strong
    const isPasswordStrong = User.isPasswordStrong(password);
    if (!isPasswordStrong) {
      return res.status(400).json({
        message:
          "Password must me at least 8 characters long, and include one uppercsase letter, one lowercase letter and one number",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    const token = user.generateJWT();
    res.status(201).json({
      token,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    // identifier can be username or email
    console.log(req.body);
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // check if user exists
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate JWT token
    const token = user.generateJWT();
    res.status(200).json({
      token,
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
