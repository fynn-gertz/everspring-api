import { logger } from '../utils/logger.js';

export const requireAdminAuth = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid authorization header');
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return false;
  }

  const token = authHeader.substring(7);
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    logger.warn('ADMIN_TOKEN not set');
    res.status(500).json({ success: false, error: 'Server not configured' });
    return false;
  }

  if (token !== expected) {
    logger.warn('Invalid admin token');
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return false;
  }

  return true;
};
