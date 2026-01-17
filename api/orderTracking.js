import { everspringClient } from './utils/everspringClient.js';
import { cache, TTL } from './utils/cache.js';
import { dataStore } from './utils/dataStore.js';
import { handleError, setCorsHeaders, handleOptions } from './middleware/errorHandler.js';

export default async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return handleOptions(req, res);
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Order ID is required' });

    const orderData = dataStore.getOrder(id);
    if (!orderData) return res.status(404).json({ success: false, error: 'Order not found' });

    const supplierId = orderData.supplier_order_id;
    const cacheKey = `order:${supplierId}:tracking`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, cached: true, timestamp: new Date().toISOString() });
    }

    const tracking = await everspringClient.getOrderTracking(supplierId);

    const trackingData = {
      carrier: tracking.carrier || 'Unknown',
      trackingNumber: tracking.trackingNumber || null,
      estimatedDelivery: tracking.estimatedDelivery || null,
      status: tracking.status || 'unknown'
    };

    cache.set(cacheKey, trackingData, TTL.TRACKING);

    return res.status(200).json({ success: true, data: trackingData, cached: false, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleError(error, res);
  }
};
