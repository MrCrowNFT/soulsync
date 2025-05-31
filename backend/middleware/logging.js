import logger from "../utils/logger.js";

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  req.requestId = requestId;
  req.logger = logger.child({ requestId });

  req.logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    req.logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    originalSend.call(this, data);
  };

  next();
};

// Global error middleware
export const errorLogger = (error, req, res, next) => {
  const requestLogger = req.logger || logger;
  requestLogger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};