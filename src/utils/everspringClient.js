import fetch from 'node-fetch';
import { logger } from './logger.js';
import { retry } from './retry.js';

const API_KEY = process.env.EVERSPRING_API_KEY;
const BASE_URL = process.env.EVERSPRING_BASE_URL;

if (!API_KEY) {
  logger.error('EVERSPRING_API_KEY is not set');
}

if (!BASE_URL) {
  logger.error('EVERSPRING_BASE_URL is not set');
}

export const everspringClient = {
  async request(method, endpoint, data = null) {
    const url = `${BASE_URL}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'pflanzenXL-Everspring-Client/1.0'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    return retry(async () => {
      logger.info(`Everspring request: ${method} ${url}`);

      const response = await fetch(url, options);

      if (!response.ok) {
        let responseBody = {};

        try {
          responseBody = await response.json();
        } catch {
          responseBody = {};
        }

        logger.error(`Everspring error ${response.status} for ${url}`);
        logger.error(`Everspring response: ${JSON.stringify(responseBody)}`);

        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        error.response = responseBody;
        throw error;
      }

      return response.json();
    });
  },

  async getProducts(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = `/products${query ? `?${query}` : ''}`;
    return this.request('GET', endpoint);
  },

  async getProduct(productId) {
    return this.request('GET', `/products/${productId}`);
  },

  async createOrder(orderData) {
    return this.request('POST', '/orders', orderData);
  },

  async getOrder(orderId) {
    return this.request('GET', `/orders/${orderId}`);
  },

  async getOrderTracking(orderId) {
    return this.request('GET', `/orders/${orderId}/tracking`);
  }
};