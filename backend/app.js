import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import { requestLogger, errorLogger } from "./middleware/logging.js";
import authRouter from "./routers/auth.routes.js";
import moodEntryRouter from "./routers/mood-entry.routes.js";
import { authenticate } from "./middleware/auth.js";
import chatEntryRouter from "./routers/chat-entry.routes.js";
import userRouter from "./routers/user.routes.js";
import assesmentRouter from "./routers/assesment.routes.js";

dotenv.config();

const app = express();

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

// Request logging
app.use(requestLogger);

//since vercel deploy different URLs, we add them all on the .env separated by ","
const allowedOrigins = process.env.FRONTEND_URLS?.split(",") || [];
logger.info('CORS configured', { allowedOrigins: allowedOrigins.length });

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request', { origin });
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/mood", authenticate, moodEntryRouter);
app.use("/chat", authenticate, chatEntryRouter);
app.use("/user", authenticate, userRouter);
app.use("/assessment", authenticate, assesmentRouter);

// Error logging middleware (must be last)
app.use(errorLogger);

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  try {
    await connectDB();
    logger.info('Server started successfully', { 
      port: PORT, 
      environment: process.env.NODE_ENV || 'development',
      logLevel: logger.level
    });
  } catch (error) {
    logger.error('Failed to start server', { 
      error: error.message, 
      stack: error.stack 
    });
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});