import crypto from 'crypto';
import { everspringClient } from './utils/everspringClient.js';
import { validation } from './utils/validation.js';
import { dataStore } from './utils/dataStore.js';
import { handleError, setCorsHeaders, handleOptions } from './middleware/errorHandler.js';

export default async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return handleOptions(req, res);
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const orderData = req.body;
    validation.validateOrderData(orderData);

    const localOrderId = crypto.randomUUID();

    const everspringOrder = await everspringClient.createOrder({
      items: orderData.items,
      customer: orderData.customer,
      shippingAddress: orderData.shippingAddress
    });

    dataStore.saveOrder(localOrderId, {
      supplier_order_id: everspringOrder.id,
      status: 'pending',
      items: orderData.items,
      customer: orderData.customer,
      shippingAddress: orderData.shippingAddress,
      total: everspringOrder.total || 0,
      currency: everspringOrder.currency || 'EUR'
    });

    return res.status(201).json({
      success: true,
      data: {
        local_order_id: localOrderId,
        supplier_order_id: everspringOrder.id,
        status: 'pending',
        items: orderData.items,
        total: everspringOrder.total || 0,
        currency: everspringOrder.currency || 'EUR'
      }
    });
  } catch (error) {
    return handleError(error, res);
  }
};
