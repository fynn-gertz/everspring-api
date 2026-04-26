import { everspringClient } from '../utils/everspringClient.js';
import { handleError, setCorsHeaders, handleOptions } from '../middleware/errorHandler.js';

export default async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return handleOptions(req, res);
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    const catalog = await everspringClient.getProducts();

    const products =
      Array.isArray(catalog) ? catalog :
      Array.isArray(catalog.data) ? catalog.data :
      Array.isArray(catalog.results) ? catalog.results :
      [];

    const product = products.find(p => String(p.id) === String(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in catalog',
        debugShape: Object.keys(catalog || {}),
        sample: products[0] || null
      });
    }

    return res.status(200).json({
      success: true,
      raw: product,
      keys: Object.keys(product || {}),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleError(error, res);
  }
};