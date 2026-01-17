import { logger } from './logger.js';

class DataStore {
  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.importedProductcodes = new Set();
  }

  setProduct(id, product) {
    this.products.set(id, product);
  }

  getProduct(id) {
    return this.products.get(id);
  }

  saveOrder(localOrderId, orderData) {
    this.orders.set(localOrderId, {
      ...orderData,
      createdAt: Date.now()
    });
    logger.info('Order saved', { localOrderId, supplierId: orderData.supplier_order_id });
  }

  getOrder(localOrderId) {
    return this.orders.get(localOrderId);
  }

  addImportedProductcode(code) {
    this.importedProductcodes.add(code.toUpperCase());
  }

  isProductcodeImported(code) {
    return this.importedProductcodes.has(code.toUpperCase());
  }
}

export const dataStore = new DataStore();
