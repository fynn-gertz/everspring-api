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
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const attr = product.attributes || {};

    const mapped = {
      id: product.id,
      title: attr.text?.NL?.title || attr.text?.EN?.title || 'Product',
      description: attr.text?.NL?.description || attr.text?.EN?.description || '',
      price: attr.prices?.NL || attr.prices?.DE || 0,
      currency: 'EUR',
      stock: attr.stock || 0,
      images: attr.images || [],
      collection: 'Plants'
    };

    return res.status(200).json({
      success: true,
      data: mapped,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleError(error, res);
  }
};