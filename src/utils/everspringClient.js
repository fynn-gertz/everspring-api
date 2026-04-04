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
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${BASE_URL}${endpoint}${separator}api_key=${encodeURIComponent(API_KEY)}`;

    const options = {
      method,
      headers: {
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
      const text = await response.text();

      let body = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { raw: text };
      }

      if (!response.ok) {
        logger.error(`Everspring error ${response.status} for ${url}`);
        logger.error(`Everspring response: ${JSON.stringify(body)}`);

        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        error.response = body;
        throw error;
      }

      return body;
    });
  },

  async getProducts(filters = {}) {
    const params = new URLSearchParams({
      response_format: 'json',
      ...filters
    }).toString();

    return this.request('GET', `/products/?${params}`);
  },

  async getProduct(productId) {
    return this.request('GET', `/products/${productId}/?response_format=json`);
  },

  async createOrder(orderData) {
    return this.request('POST', `/orders/`, orderData);
  },

  async getOrder(orderId) {
    return this.request('GET', `/orders/${orderId}/`);
  },

  async getOrderTracking(orderReference) {
    const params = new URLSearchParams({
      'filter[order__reference]': orderReference
    }).toString();

    return this.request('GET', `/shipments/?${params}`);
  }
};