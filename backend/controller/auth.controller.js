import { User } from "../models/user.model.js";
import RefreshToken from "../models/refresh-token.model.js";
import {
  generateTokens,
  generateAccessToken,
} from "../helpers/auth.helpers.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

export const login = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const { username, password } = req.body;

    requestLogger.info("Login attempt started", { username });

    //todo eventually need to add popultate("memory"), when memory showing and deleting is added
    const user = await User.findOne({ username }).select("+password"); //explicitly select password for comparison
    if (!user) {
      requestLogger.warn("Login failed - user not found", { username });
      res.status(401).json({ success: false, message: "Invalid username" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      requestLogger.warn("Login failed - invalid password", {
        username,
        userId: user._id,
      });
      res.status(401).json({ success: false, message: "Invalid password" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);

    //store the refresh token on db
    const createdToken = await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //* 7 days -> If changing the REFRESH_TOKEN_EXPIRY don't forget to also change this
    });
    if (!createdToken) {
      requestLogger.error("Login failed - could not save refresh token", {
        username,
        userId: user._id,
      });
      return res.status(400).json({
        success: false,
        message: "Failed to save refresh token on database",
      });
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    //return a user object without the password
    const userData = user.toObject();
    delete userData.password;

    requestLogger.info("Login successful", {
      username,
      userId: user._id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      data: userData,
    });
  } catch (error) {
    requestLogger.error("Login error", {
      error: error.message,
      stack: error.stack,
      username: req.body?.username,
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const refreshAccessToken = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    requestLogger.info("Refresh token process started");

    //check refresh token from the cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      requestLogger.warn("Refresh token failed - no token in cookies");
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }

    //check if refresh token exist on db
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      requestLogger.warn("Refresh token failed - token not found in database", {
        tokenPrefix: refreshToken.substring(0, 10),
      });
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    //check if refresh token isn't expired
    const currentTime = new Date();
    if (storedToken.expiresAt < currentTime) {
      requestLogger.warn("Refresh token failed - token expired", {
        tokenId: storedToken._id,
        expiresAt: storedToken.expiresAt,
      });
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res
        .status(401)
        .json({ success: false, message: "Refresh token expired" });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      //If verification fails, delete the stored refresh token from the database
      //as a security measure -> if someone tries to use an invalid token (possibly tampered with), we remove it from the system entirely
      requestLogger.warn("Refresh token failed - JWT verification failed", {
        error: error.message,
        tokenId: storedToken._id,
      });
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded._id);

    if (!user) {
      requestLogger.warn("Refresh token failed - user not found", {
        userId: decoded._id,
      });
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const accessToken = generateAccessToken(user);

    requestLogger.info("Refresh token successful", {
      userId: user._id,
      username: user.username,
    });

    return res.status(200).json({
      success: true,
      message: "Refresh successful",
      accessToken,
    });
  } catch (error) {
    requestLogger.error("Refresh token error", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      requestLogger.warn("Logout failed - no refresh token provided");
      res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
      return;
    }

    const deletedToken = await RefreshToken.deleteOne({ token: refreshToken });

    if (!deletedToken) {
      requestLogger.error("Logout failed - could not delete refresh token");
      res.status(400).json({
        success: false,
        message: "Refresh token could not be deleted",
      });
      return;
    }

    // Clear the cookie
    res.clearCookie("refreshToken");

    requestLogger.info("Logout successful", {
      userId: req.user?.id || req.user?._id,
      username: req.user?.username,
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    requestLogger.error("Logout error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || req.user?._id,
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const signup = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const {
      username,
      password,
      email,
      name,
      lastName,
      gender,
      birthDate,
      photo,
    } = req.body;

    requestLogger.info("Signup attempt started", { username, email });

    // Check required fields
    if (!username || !password || !email || !name || !lastName || !gender) {
      requestLogger.warn("Signup failed - missing required fields", {
        username,
        email,
        missingFields: {
          username: !username,
          password: !password,
          email: !email,
          name: !name,
          lastName: !lastName,
          gender: !gender,
        },
      });
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Please provide username, password, email, name, lastName, gender, and birthDate.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      requestLogger.warn("Signup failed - invalid email format", {
        username,
        email,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate gender
    const validGenders = [
      "male",
      "female",
      "non-binary",
      "other",
      "prefer-not-to-say",
    ];
    if (!validGenders.includes(gender)) {
      requestLogger.warn("Signup failed - invalid gender", {
        username,
        email,
        gender,
      });
      return res.status(400).json({
        success: false,
        message:
          "Invalid gender value. Must be one of: male, female, non-binary, other, prefer-not-to-say",
      });
    }

    let birthDateObj = null;
    // Validate birth date if included
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime()) || birthDateObj >= new Date()) {
        requestLogger.warn("Signup failed - invalid birth date", {
          username,
          email,
          birthDate,
        });
        return res.status(400).json({
          success: false,
          message:
            "Invalid birth date. Date must be valid and not in the future.",
        });
      }
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      requestLogger.warn("Signup failed - username already exists", {
        username,
        email,
      });
      return res.status(400).json({
        success: false,
        message: "Username already in use",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      requestLogger.warn("Signup failed - email already exists", {
        username,
        email,
      });
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const newUser = new User({
      username,
      password,
      email,
      name,
      lastName,
      gender,
      birthDate: birthDateObj,
      photo: photo || "",
      // Initialize empty arrays for references
      moodEntries: [],
      memories: [],
    });

    await newUser.save();

    requestLogger.info("Signup successful", {
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
    });

    // success response without password
    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    requestLogger.error("Signup error", {
      error: error.message,
      stack: error.stack,
      username: req.body?.username,
      email: req.body?.email,
    });
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
