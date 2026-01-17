import { everspringClient } from '../utils/everspringClient.js';
import { validation } from '../utils/validation.js';
import { dataStore } from '../utils/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { handleError, setCorsHeaders, handleOptions } from '../middleware/errorHandler.js';

export default async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return handleOptions(req, res);
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  if (!requireAdminAuth(req, res)) return;

  try {
    const { productcodes, collection, skipDuplicates } = req.body;

    const validatedCodes = validation.validateProductcodes(productcodes);
    validation.validateCollection(collection);

    const results = [];
    let added = 0;
    let skipped = 0;
    let failed = 0;

    for (const code of validatedCodes) {
      try {
        if (skipDuplicates && dataStore.isProductcodeImported(code)) {
          results.push({ productcode: code, status: 'skipped', reason: 'duplicate' });
          skipped++;
          continue;
        }

        // Supplier-side lookup by product code (SKU). Adjust param if docs differ.
        const products = await everspringClient.getProducts({ sku: code });

        const list = products.products || products.data || [];
        if (!Array.isArray(list) || list.length === 0) {
          results.push({ productcode: code, status: 'failed', reason: 'not found in supplier' });
          failed++;
          continue;
        }

        const product = list[0];

        dataStore.setProduct(product.id, {
          id: product.id,
          productcode: code,
          title: product.name || product.title,
          description: product.description || '',
          price: product.price || 0,
          currency: product.currency || 'EUR',
          stock: product.stock ?? product.inventory ?? 0,
          images: product.images || [],
          collection
        });

        dataStore.addImportedProductcode(code);

        results.push({ productcode: code, status: 'added', productId: product.id, title: product.name || product.title, collection });
        added++;
      } catch (err) {
        results.push({ productcode: code, status: 'failed', reason: err.message });
        failed++;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        total: validatedCodes.length,
        added,
        skipped,
        failed,
        results
      }
    });
  } catch (error) {
    return handleError(error, res);
  }
};
