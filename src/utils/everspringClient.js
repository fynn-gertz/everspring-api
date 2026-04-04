import fetch from 'node-fetch';
import { logger } from './logger.js';
import { retry } from './retry.js';

const API_KEY = process.env.EVERSPRING_API_KEY;
const BASE_URL = process.env.EVERSPRING_BASE_URL;
const CHANNEL_ID = process.env.EVERSPRING_CHANNEL_ID;

if (!API_KEY) {
  logger.error('EVERSPRING_API_KEY is not set');
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
      logger.info(`${method} ${endpoint}`);

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        try {
          error.response = await response.json();
        } catch {
          error.response = {};
        }
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
