import { logger } from '../utils/logger.js';

export const handleError = (error, res) => {
  logger.error('Request error', { message: error.message, status: error.status || 500 });

  const status = error.status || 500;
  let message = 'An error occurred';

  if (status === 401) message = 'Authentication failed';
  else if (status === 404) message = 'Resource not found';
  else if (status === 429) message = 'Rate limit exceeded. Please try again later.';
  else if (status >= 500) message = 'Supplier service unavailable. Please try again later.';
  else if (status >= 400) message = error.message || 'Invalid request';

  res.status(status).json({ success: false, error: message });
};

export const setCorsHeaders = (res) => {
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  // Vercel expects a single origin; if you supply comma-separated, echo back the request origin when allowed
  // We'll do minimal safe handling here.
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
};

export const handleOptions = (req, res) => {
  setCorsHeaders(res);
  res.status(200).end();
};
