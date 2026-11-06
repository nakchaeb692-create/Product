/**
 * Currency, number, and calculation utilities with safe number fallbacks
 */

export function formatCurrency(value: number | undefined | null): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(value: number | undefined | null): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value: number | undefined | null, decimals = 1): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return `${num.toFixed(decimals)}%`;
}

export function calculateProfit(cost: number, sale: number): number {
  const safeCost = typeof cost === 'number' && !isNaN(cost) ? cost : 0;
  const safeSale = typeof sale === 'number' && !isNaN(sale) ? sale : 0;
  return safeSale - safeCost;
}

export function calculateMargin(cost: number, sale: number): number {
  const safeCost = typeof cost === 'number' && !isNaN(cost) ? cost : 0;
  const safeSale = typeof sale === 'number' && !isNaN(sale) ? sale : 0;
  if (safeSale <= 0) return 0;
  return ((safeSale - safeCost) / safeSale) * 100;
}

export function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
