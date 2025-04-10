import User from "../models/user.model.js";
import RefreshToken from "../models/refresh-token.model.js";
import {
  generateTokens,
  generateAccessToken,
} from "../helpers/auth.helpers.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password"); //explicitly select password for comparison
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid username" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
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
      res.status(400).json({
        success: false,
        message: "Failed to save refresh token on database",
      });
      return;
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    //create a user object without the password for common sense reasons
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      data: userData,
    });
  } catch (error) {
    console.error(`Error during login: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    //check refresh token from the cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
      return;
    }

    //check if refresh token exist on db
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
      return;
    }

    //check if refresh token isn't expired
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      res
        .status(401)
        .json({ success: false, message: "Refresh token expired" });
      return;
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      //If verification fails, delete the stored refresh token from the database
      //as a security measure -> if someone tries to use an invalid token (possibly tampered with), we remove it from the system entirely
      await RefreshToken.deleteOne({ _id: storedToken._id });
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      message: "Refresh successful",
      accessToken,
    });
  } catch (error) {
    console.error(`Error refreshing token: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
      return;
    }

    const deletedToken = await RefreshToken.deleteOne({ token: refreshToken });

    if (!deletedToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token could not be deleted",
      });
      return;
    }

    // Clear the cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(`Error during logout: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const signup = async (req, res) => {
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

    // Check required fields
    if (!username || !password || !email || !name || !lastName || !gender) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Please provide username, password, email, name, lastName, gender, and birthDate.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
      return res.status(400).json({
        success: false,
        message:
          "Invalid gender value. Must be one of: male, female, non-binary, other, prefer-not-to-say",
      });
    }

    // Validate birth date if included
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime()) || birthDateObj >= new Date()) {
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
      return res.status(400).json({
        success: false,
        message: "Username already in use",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
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

    // success response without password
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
