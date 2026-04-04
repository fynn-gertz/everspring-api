import { logger } from '../utils/logger.js';

export const handleError = (error, res) => {
  logger.error('Request error', {
    message: error.message,
    status: error.status || 500,
    response: error.response || null
  });

  const status = error.status || 500;

  res.status(status).json({
    success: false,
    error: error.message || 'An error occurred',
    details: error.response || null
  });
};

export const setCorsHeaders = (res) => {
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
};

export const handleOptions = (req, res) => {
  setCorsHeaders(res);
  res.status(200).end();
};