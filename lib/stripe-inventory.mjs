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

export function inventoryAdjustment(product, quantity, sessionId) {
  if (!product || typeof product !== 'object' || product.deleted) {
    return { status: 'invalid_product' };
  }
  if (product.metadata?.dc_last_sale_session === sessionId) {
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
