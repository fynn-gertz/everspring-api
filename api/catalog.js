import { everspringClient } from './utils/everspringClient.js';
import { cache, TTL } from './utils/cache.js';
import { handleError, setCorsHeaders, handleOptions } from './middleware/errorHandler.js';

export default async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return handleOptions(req, res);
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const cached = cache.get('catalog');
    if (cached) {
      return res.status(200).json({ success: true, data: cached, cached: true, timestamp: new Date().toISOString() });
    }

    const response = await everspringClient.getProducts();
    const list = response.products || response.data || [];
    if (!Array.isArray(list)) throw new Error('Invalid response format from supplier');

    const products = list.map((product) => ({
      id: product.id,
      productcode: product.sku || product.code || product.productcode,
      title: product.name || product.title,
      description: product.description || '',
      price: product.price || 0,
      currency: product.currency || 'EUR',
      stock: product.stock ?? product.inventory ?? 0,
      images: product.images || [],
      collection: product.collection || 'Uncategorized'
    }));

    cache.set('catalog', products, TTL.CATALOG);

    return res.status(200).json({ success: true, data: products, cached: false, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleError(error, res);
  }
};
