import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    logger.info("Database connection attempt started", {
      mongoUri: process.env.MONGO_URI ? "configured" : "missing",
      nodeEnv: process.env.NODE_ENV,
    });

    const connectionStart = Date.now();
    const conn = await mongoose.connect(process.env.MONGO_URI);
    const connectionDuration = Date.now() - connectionStart;

    logger.info("MongoDB connected successfully", {
      host: conn.connection.host,
      port: conn.connection.port,
      database: conn.connection.name,
      connectionDuration: `${connectionDuration}ms`,
      readyState: conn.connection.readyState,
      connectionId: conn.connection.id,
    });

    // Log connection events
    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connection established");
    });

    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error", {
        error: error.message,
        stack: error.stack,
      });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection lost");
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (error) {
        logger.error("Error closing MongoDB connection", {
          error: error.message,
          stack: error.stack,
        });
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("Database connection failed", {
      error: error.message,
      stack: error.stack,
      mongoUri: process.env.MONGO_URI ? "configured" : "missing",
      errorName: error.name,
      errorCode: error.code,
    });
    process.exit(1);
  }
};

export default connectDB;
