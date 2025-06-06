import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";
import { uploadImageToS3 } from "../utils/s3Uploader.util.js";

//todo This functions is not currently needed, user profile is gotten from the login function so maybe just remove it
/**
 * Get user profile using _id from token
 * @route GET /user
 * @access Private
 */
export const getUser = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user._id;

    requestLogger.info("Get user profile process started", {
      userId,
    });

    const startTime = Date.now();
    const user = await User.findById(userId).select("-password");
    const queryDuration = Date.now() - startTime;

    if (!user) {
      requestLogger.warn("Get user profile failed - user not found", {
        userId,
        queryDuration: `${queryDuration}ms`,
      });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    requestLogger.info("User profile retrieved successfully", {
      userId,
      queryDuration: `${queryDuration}ms`,
      username: user.username,
      email: user.email,
      hasPhoto: !!user.photo,
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    requestLogger.error("Get user profile process error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });

    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

//todo not sure if i want handle changing email and password here
/**
 * Update user profile
 * @route PUT /user
 * @access Private
 */
export const updateUser = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user._id;
    const { username, password, email, name, lastName, gender, birthDate } =
      req.body;

    const photo = req.file; 

    const fieldsToUpdate = Object.keys(req.body).filter(
      (key) => req.body[key] !== undefined
    );

    requestLogger.info("Update user process started", {
      userId,
      fieldsToUpdate,
      hasPassword: !!password,
      requestBodyKeys: Object.keys(req.body),
    });

    const findUserStart = Date.now();
    const user = await User.findById(userId);
    const findUserDuration = Date.now() - findUserStart;

    if (!user) {
      requestLogger.warn("Update user failed - user not found", {
        userId,
        findUserDuration: `${findUserDuration}ms`,
      });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Track which fields are being updated
    const updatedFields = [];

    // Update fields only if provided
    if (username) {
      user.username = username;
      updatedFields.push("username");
    }
    if (email) {
      user.email = email;
      updatedFields.push("email");
    }
    if (name) {
      user.name = name;
      updatedFields.push("name");
    }
    if (lastName) {
      user.lastName = lastName;
      updatedFields.push("lastName");
    }
    if (gender) {
      user.gender = gender;
      updatedFields.push("gender");
    }
    if (birthDate) {
      user.birthDate = new Date(birthDate);
      updatedFields.push("birthDate");
    }
    if (photo) {
      try {
        const photoUrl = await uploadImageToS3(photo, user.photo);
        user.photo = photoUrl;
        updatedFields.push("photo");
      } catch (uploadError) {
        requestLogger.error("Photo upload failed", {
          userId,
          error: uploadError.message,
        });
        //either fail the entire update or continue without photo
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }
    }

    // Handle password separately to ensure it gets hashed
    if (password) {
      user.password = password;
      updatedFields.push("password");
    }

    requestLogger.info("User fields prepared for update", {
      userId,
      updatedFields,
      fieldsCount: updatedFields.length,
    });

    const saveStart = Date.now();
    const updatedUser = await user.save();
    const saveDuration = Date.now() - saveStart;

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

    requestLogger.info("User profile updated successfully", {
      userId,
      updatedFields,
      fieldsCount: updatedFields.length,
      saveDuration: `${saveDuration}ms`,
      username: updatedUser.username,
      email: updatedUser.email,
    });

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    requestLogger.error("Update user process error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      requestBody: {
        fieldsProvided: Object.keys(req.body || {}),
        hasPassword: !!(req.body && req.body.password),
      },
      errorCode: error.code,
      errorName: error.name,
    });

    // Handle duplicate key errors (username or email already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      requestLogger.warn("Update user failed - duplicate key error", {
        userId: req.user?._id,
        duplicateField: field,
        errorCode: error.code,
      });

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

      requestLogger.warn("Update user failed - validation error", {
        userId: req.user?._id,
        validationErrors: messages,
        errorFields: Object.keys(error.errors || {}),
      });

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

/**
 * Delete user account
 * @route DELETE /user
 * @access Private
 */
export const deleteUserAccount = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user._id;

    requestLogger.info("Delete user account process started", {
      userId,
    });

    const findStart = Date.now();
    const user = await User.findById(userId);
    const findDuration = Date.now() - findStart;

    if (!user) {
      requestLogger.warn("Delete user account failed - user not found", {
        userId,
        findDuration: `${findDuration}ms`,
      });
      return res.status(404).json({ message: "User not found" });
    }

    const deleteStart = Date.now();
    await User.findByIdAndDelete(userId);
    const deleteDuration = Date.now() - deleteStart;

    requestLogger.info("User account deleted successfully", {
      userId,
      username: user.username,
      email: user.email,
      findDuration: `${findDuration}ms`,
      deleteDuration: `${deleteDuration}ms`,
      totalDuration: `${findDuration + deleteDuration}ms`,
    });

    return res
      .status(200)
      .json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    requestLogger.error("Delete user account process error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });

    return res.status(500).json({
      success: false,
      message: "Error deleting user account",
      error: error.message,
    });
  }
};
