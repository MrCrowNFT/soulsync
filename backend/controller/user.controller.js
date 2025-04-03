import { User } from "../modules/user.model";
import mongoose from "mongoose";

/**
 * Get user profile using _id from token
 * @route GET /user/profile
 * @access Private
 */
export const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    //todo populate the memories, mood entries?
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

/**
 * Update user profile
 * @route PUT /users/profile
 * @access Private
 */
export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
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

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update fields only if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (name) user.name = name;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (birthDate) user.birthDate = new Date(birthDate);
    if (photo) user.photo = photo;

    // Handle password separately to ensure it gets hashed
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    // Return the updated user without password
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      gender: updatedUser.gender,
      birthDate: updatedUser.birthDate,
      email: updatedUser.email,
      photo: updatedUser.photo,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle duplicate key errors (username or email already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

/**
 * Delete user account
 * @route DELETE /users/profile
 * @access Private
 */
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    res
      .status(200)
      .json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting user account",
        error: error.message,
      });
  }
};
