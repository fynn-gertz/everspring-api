import { everspringClient } from '../utils/everspringClient.js';
import { cache, TTL } from '../utils/cache.js';
import { handleError, setCorsHeaders, handleOptions } from '../middleware/errorHandler.js';

export default async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return handleOptions(req, res);
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Product ID is required' });

    const cacheKey = `product:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, cached: true, timestamp: new Date().toISOString() });
    }

    const product = await everspringClient.getProduct(id);

    const mapped = {
      id: product.id,
      productcode: product.sku || product.code || product.productcode,
      title: product.name || product.title,
      description: product.description || '',
      price: product.price || 0,
      currency: product.currency || 'EUR',
      stock: product.stock ?? product.inventory ?? 0,
      images: product.images || [],
      collection: product.collection || 'Uncategorized'
    };

    cache.set(cacheKey, mapped, TTL.PRODUCT);

    return res.status(200).json({ success: true, data: mapped, cached: false, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleError(error, res);
  }
};
