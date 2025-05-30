import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

export const authenticate = (req, res, next) => {
  const requestLogger = req.logger || logger;
  const authHeader = req.headers.authorization;
  const requestId = req.requestId || "unknown";
  const clientIp = req.ip || req.connection.remoteAddress;

  requestLogger.info("Authentication attempt started", {
    hasAuthHeader: !!authHeader,
    authHeaderFormat: authHeader
      ? authHeader.startsWith("Bearer ")
        ? "Bearer"
        : "invalid"
      : "none",
    clientIp,
    userAgent: req.get("User-Agent"),
    path: req.path,
    method: req.method,
  });

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    requestLogger.warn(
      "Authentication failed - missing or invalid auth header",
      {
        hasAuthHeader: !!authHeader,
        authHeaderStart: authHeader
          ? authHeader.substring(0, 10) + "..."
          : "none",
        clientIp,
        path: req.path,
        method: req.method,
      }
    );

    res
      .status(401)
      .json({ success: false, message: "Unauthorized - No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const hasToken = !!token;
  const tokenLength = token ? token.length : 0;

  requestLogger.info("Token extraction completed", {
    hasToken,
    tokenLength,
    tokenStart: token ? token.substring(0, 10) + "..." : "none",
  });

  try {
    const verificationStart = Date.now();
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const verificationDuration = Date.now() - verificationStart;

    req.user = decoded;

    requestLogger.info("Authentication successful", {
      userId: decoded._id || decoded.id,
      username: decoded.username,
      email: decoded.email,
      verificationDuration: `${verificationDuration}ms`,
      tokenExp: decoded.exp ? new Date(decoded.exp * 1000) : "unknown",
      tokenIat: decoded.iat ? new Date(decoded.iat * 1000) : "unknown",
      clientIp,
    });

    next();
  } catch (error) {
    let errorType = "unknown";
    let errorDetails = {};

    if (error.name === "TokenExpiredError") {
      errorType = "expired";
      errorDetails = {
        expiredAt: error.expiredAt,
        now: new Date(),
      };
    } else if (error.name === "JsonWebTokenError") {
      errorType = "invalid";
      errorDetails = {
        reason: error.message,
      };
    } else if (error.name === "NotBeforeError") {
      errorType = "not_active";
      errorDetails = {
        date: error.date,
        now: new Date(),
      };
    }

    requestLogger.warn("Authentication failed - token verification error", {
      errorType,
      errorName: error.name,
      errorMessage: error.message,
      ...errorDetails,
      tokenLength,
      clientIp,
      path: req.path,
      method: req.method,
      hasSecret: !!process.env.JWT_ACCESS_SECRET,
    });

    res
      .status(401)
      .json({ success: false, message: "Unauthorized - Invalid token" });
  }
};
