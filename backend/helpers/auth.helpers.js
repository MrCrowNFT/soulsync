import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

// Constants for token expiration -> subject to change
const ACCESS_TOKEN_EXPIRY = "5m";
const REFRESH_TOKEN_EXPIRY = "30d";

/**
 * Validates that all required environment variables exist
 * @param {string[]} requiredVars - Array of required environment variable names
 * @throws {Error} If any required variable is missing
 */
const validateEnvironmentVars = (requiredVars) => {
  logger.debug("Validating environment variables", {
    requiredCount: requiredVars.length,
    variables: requiredVars,
  });

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    logger.error("Missing required environment variables", {
      missing,
      requiredVars,
      missingCount: missing.length,
    });

    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  logger.debug("Environment variables validated successfully", {
    validatedCount: requiredVars.length,
  });
};

/**
 * Generate an access token for a user
 * @param {Object} user - User object containing _id and username
 * @returns {string} JWT access token
 * @throws {Error} If required environment variables are missing
 */
export const generateAccessToken = (user) => {
  logger.debug("Access token generation started", {
    userId: user?._id,
    username: user?.username,
    expiry: ACCESS_TOKEN_EXPIRY,
  });

  try {
    validateEnvironmentVars(["JWT_ACCESS_SECRET"]);

    // MongoDB adds an id as _id automatically
    if (!user || !user._id || !user.username) {
      logger.warn("Access token generation failed - invalid user object", {
        hasUser: !!user,
        hasId: !!user?._id,
        hasUsername: !!user?.username,
        userType: typeof user,
      });
      throw new Error("Invalid user object provided");
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    logger.info("Access token generated successfully", {
      userId: user._id,
      username: user.username,
      expiry: ACCESS_TOKEN_EXPIRY,
      tokenLength: token.length,
    });

    return token;
  } catch (error) {
    logger.error("Access token generation error", {
      error: error.message,
      userId: user?._id,
      username: user?.username,
      stack: error.stack,
    });

    throw error;
  }
};

/**
 * Generate a refresh token for a user
 * @param {Object} user - User object containing _id and username
 * @returns {string} JWT refresh token
 * @throws {Error} If required environment variables are missing
 */
export const generateRefreshToken = (user) => {
  logger.debug("Refresh token generation started", {
    userId: user?._id,
    username: user?.username,
    expiry: REFRESH_TOKEN_EXPIRY,
  });

  try {
    validateEnvironmentVars(["JWT_REFRESH_SECRET"]);

    if (!user || !user._id || !user.username) {
      logger.warn("Refresh token generation failed - invalid user object", {
        hasUser: !!user,
        hasId: !!user?._id,
        hasUsername: !!user?.username,
        userType: typeof user,
      });
      throw new Error("Invalid user object provided");
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    logger.info("Refresh token generated successfully", {
      userId: user._id,
      username: user.username,
      expiry: REFRESH_TOKEN_EXPIRY,
      tokenLength: token.length,
    });

    return token;
  } catch (error) {
    logger.error("Refresh token generation error", {
      error: error.message,
      userId: user?._id,
      username: user?.username,
      stack: error.stack,
    });

    throw error;
  }
};

/**
 * Generate both access and refresh tokens for a user
 * @param {Object} user - User object containing _id and username
 * @returns {Object} Object containing accessToken and refreshToken
 * @throws {Error} If required environment variables are missing
 */
export const generateTokens = (user) => {
  const startTime = Date.now();

  logger.info("Token pair generation started", {
    userId: user?._id,
    username: user?.username,
    accessTokenExpiry: ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: REFRESH_TOKEN_EXPIRY,
  });

  try {
    validateEnvironmentVars(["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"]);

    if (!user || !user._id || !user.username) {
      logger.warn("Token pair generation failed - invalid user object", {
        hasUser: !!user,
        hasId: !!user?._id,
        hasUsername: !!user?.username,
        userType: typeof user,
      });
      throw new Error("Invalid user object provided");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const duration = Date.now() - startTime;

    logger.info("Token pair generated successfully", {
      userId: user._id,
      username: user.username,
      duration: `${duration}ms`,
      accessTokenLength: accessToken.length,
      refreshTokenLength: refreshToken.length,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Token pair generation error", {
      error: error.message,
      userId: user?._id,
      username: user?.username,
      duration: `${duration}ms`,
      stack: error.stack,
    });

    throw error;
  }
};
