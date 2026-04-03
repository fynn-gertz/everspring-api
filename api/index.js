import orderHandler from '../src/handlers/order.js';
import productHandler from '../src/handlers/product.js';
import catalogHandler from '../src/handlers/catalog.js';

export default async function handler(req, res) {
  const url = req.url || '';

  if (url.startsWith('/api/order')) {
    return orderHandler(req, res);
  }

  if (url.startsWith('/api/product')) {
    return productHandler(req, res);
  }

  if (url.startsWith('/api/catalog')) {
    return catalogHandler(req, res);
  }

  return res.status(404).json({
    success: false,
    error: 'Not found'
  });
}