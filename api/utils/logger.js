const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const maskSensitive = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const masked = { ...obj };
  const sensitiveKeys = ['EVERSPRING_API_KEY', 'password', 'token', 'secret', 'Authorization'];
  for (const key of sensitiveKeys) {
    if (masked[key]) masked[key] = '***MASKED***';
  }
  return masked;
};

export const logger = {
  error(message, data = {}) {
    if (LEVELS[LOG_LEVEL] >= LEVELS.error) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, maskSensitive(data));
    }
  },
  warn(message, data = {}) {
    if (LEVELS[LOG_LEVEL] >= LEVELS.warn) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, maskSensitive(data));
    }
  },
  info(message, data = {}) {
    if (LEVELS[LOG_LEVEL] >= LEVELS.info) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, maskSensitive(data));
    }
  },
  debug(message, data = {}) {
    if (LEVELS[LOG_LEVEL] >= LEVELS.debug) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, maskSensitive(data));
    }
  }
};
