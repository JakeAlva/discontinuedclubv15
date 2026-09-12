export function stripeStock(product) {
  if (!product || typeof product !== 'object' || product.deleted) return null;
  const rawStock = product.metadata?.dc_stock;
  if (rawStock === undefined || rawStock === null || rawStock === '') return null;

  const stock = Number(rawStock);
  return Number.isInteger(stock) && stock >= 0 ? stock : null;
}

export function availableStripeQuantity(catalogMaximum, product) {
  const stock = stripeStock(product);
  if (stock === null) return null;

  const maximum = Math.max(1, Number(catalogMaximum) || 1);
  return Math.min(maximum, stock);
}

export function processedSessionIds(product, historyKey = 'dc_sale_sessions', legacyKey = 'dc_last_sale_session') {
  const history = String(product?.metadata?.[historyKey] || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const legacy = String(product?.metadata?.[legacyKey] || '').trim();
  return [...new Set(legacy ? [...history, legacy] : history)];
}

export function appendProcessedSession(product, sessionId, historyKey = 'dc_sale_sessions', legacyKey = 'dc_last_sale_session') {
  return [...processedSessionIds(product, historyKey, legacyKey).filter((value) => value !== sessionId), sessionId]
    .slice(-6)
    .join(',');
}

export function inventoryAdjustment(product, quantity, sessionId) {
  if (!product || typeof product !== 'object' || product.deleted) {
    return { status: 'invalid_product' };
  }
  if (processedSessionIds(product).includes(sessionId)) {
    return { status: 'already_applied', stock: stripeStock(product) };
  }

  const stock = stripeStock(product);
  const purchasedQuantity = Number(quantity);
  if (stock === null || !Number.isInteger(purchasedQuantity) || purchasedQuantity < 1) {
    return { status: 'invalid_stock' };
  }

  return {
    status: 'update',
    previousStock: stock,
    nextStock: Math.max(0, stock - purchasedQuantity)
  };
}
