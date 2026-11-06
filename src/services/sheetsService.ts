import { Product, Category } from '../types/product';

const PROXY_ENDPOINT = '/api/apps-script/proxy';
const STORAGE_KEY = 'stockpulse_products_data_v1';
const CATEGORIES_STORAGE_KEY = 'stockpulse_categories_data_v1';
const CONFIG_KEY = 'stockpulse_appscript_config_v1';

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Execute request to Google Apps Script via Express Proxy or Direct Fetch
 */
async function callAppsScript(
  scriptUrl: string,
  method: 'GET' | 'POST',
  params: Record<string, any> = {}
): Promise<any> {
  const cleanUrl = scriptUrl.trim();
  if (!cleanUrl) {
    throw new Error('Google Apps Script Web App URL is not provided.');
  }

  // Attempt 1: Call through backend proxy to bypass browser CORS preflight & 302 redirect issues
  try {
    let proxyUrl = PROXY_ENDPOINT;
    let options: RequestInit = {
      method,
      signal: AbortSignal.timeout(12000),
      headers: {
        'Accept': 'application/json',
      }
    };

    if (method === 'GET') {
      const q = new URLSearchParams();
      q.set('url', cleanUrl);
      for (const [k, v] of Object.entries(params)) {
        q.set(k, String(v));
      }
      proxyUrl += `?${q.toString()}`;
    } else {
      options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      options.body = JSON.stringify({
        _targetUrl: cleanUrl,
        ...params
      });
    }

    const res = await fetch(proxyUrl, options);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (proxyErr: any) {
    if (proxyErr?.name === 'TimeoutError') {
      throw new Error('Google Apps Script request timed out after 12 seconds.');
    }
    console.warn('Backend proxy attempt failed, trying direct browser fetch...', proxyErr);
  }

  // Attempt 2: Direct browser fetch fallback
  try {
    let directUrl = cleanUrl;
    let directOptions: RequestInit = {
      method,
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
      headers: {
        'Accept': 'application/json'
      }
    };

    if (method === 'GET') {
      const urlObj = new URL(cleanUrl);
      for (const [k, v] of Object.entries(params)) {
        urlObj.searchParams.set(k, String(v));
      }
      directUrl = urlObj.toString();
    } else {
      // POST direct: Google Apps Script accepts text/plain to avoid CORS preflight OPTIONS rejection
      directOptions.headers = {
        'Content-Type': 'text/plain;charset=utf-8'
      };
      directOptions.body = JSON.stringify(params);
    }

    const res = await fetch(directUrl, directOptions);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { status: 'success', raw: text };
    }
  } catch (err: any) {
    if (err?.name === 'TimeoutError') {
      throw new Error('Connection timed out. Check that your Apps Script Web App is deployed and accessible.');
    }
    throw new Error(`Failed to reach Google Apps Script: ${err.message || String(err)}`);
  }
}

export const sheetsService = {
  /**
   * Ping / Test Google Apps Script Web App connection
   */
  async testConnection(scriptUrl: string): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'GET', { action: 'ping' });
      if (data && (data.status === 'success' || data.products || data.message)) {
        return {
          success: true,
          message: data.message || 'Successfully connected to Google Sheet!',
          data
        };
      }
      return {
        success: false,
        message: data.message || 'Google Apps Script responded with an unexpected status.',
        error: data.message
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Could not connect to Google Apps Script. Please verify the URL and deployment settings.',
        error: err.message
      };
    }
  },

  /**
   * Fetch all products from Google Sheets via Apps Script
   */
  async fetchProducts(scriptUrl: string): Promise<{ success: boolean; products: Product[]; message?: string }> {
    try {
      const data = await callAppsScript(scriptUrl, 'GET', { action: 'getProducts' });
      if (data && data.status === 'success' && Array.isArray(data.products)) {
        return {
          success: true,
          products: data.products
        };
      }
      return {
        success: false,
        products: [],
        message: data.message || 'No products array returned from Google Sheet.'
      };
    } catch (err: any) {
      return {
        success: false,
        products: [],
        message: err.message
      };
    }
  },

  /**
   * Add a single product to Google Sheet
   */
  async addProduct(scriptUrl: string, product: Product): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'POST', {
        action: 'addProduct',
        product
      });
      if (data && data.status === 'success') {
        return { success: true, message: 'Product added to Google Sheet' };
      }
      return { success: false, message: data.message || 'Failed to add product to Google Sheet', error: data.message };
    } catch (err: any) {
      return { success: false, message: err.message, error: err.message };
    }
  },

  /**
   * Update an existing product in Google Sheet
   */
  async updateProduct(scriptUrl: string, product: Product): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'POST', {
        action: 'updateProduct',
        product
      });
      if (data && data.status === 'success') {
        return { success: true, message: 'Product updated in Google Sheet' };
      }
      return { success: false, message: data.message || 'Failed to update product in Google Sheet', error: data.message };
    } catch (err: any) {
      return { success: false, message: err.message, error: err.message };
    }
  },

  /**
   * Delete product by ProductID from Google Sheet
   */
  async deleteProduct(scriptUrl: string, productId: string): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'POST', {
        action: 'deleteProduct',
        ProductID: productId
      });
      if (data && data.status === 'success') {
        return { success: true, message: 'Product deleted from Google Sheet' };
      }
      return { success: false, message: data.message || 'Failed to delete product from Google Sheet', error: data.message };
    } catch (err: any) {
      return { success: false, message: err.message, error: err.message };
    }
  },

  /**
   * Batch sync full product list to Google Sheet (overwrites sheet contents)
   */
  async batchSync(scriptUrl: string, products: Product[]): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'POST', {
        action: 'batchSync',
        products
      });
      if (data && data.status === 'success') {
        return { success: true, message: `Successfully synced ${products.length} products to Google Sheet.` };
      }
      return { success: false, message: data.message || 'Batch sync failed', error: data.message };
    } catch (err: any) {
      return { success: false, message: err.message, error: err.message };
    }
  },

  /**
   * Fetch all categories from Google Sheet
   */
  async fetchCategories(scriptUrl: string): Promise<{ success: boolean; categories: Category[]; message?: string }> {
    try {
      const data = await callAppsScript(scriptUrl, 'GET', { action: 'getCategories' });
      if (data && data.status === 'success' && Array.isArray(data.categories)) {
        return {
          success: true,
          categories: data.categories
        };
      }
      return {
        success: false,
        categories: [],
        message: data.message || 'No categories returned from Google Sheet.'
      };
    } catch (err: any) {
      return {
        success: false,
        categories: [],
        message: err.message
      };
    }
  },

  /**
   * Add a single category to Google Sheet
   */
  async addCategory(scriptUrl: string, category: Category): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'POST', {
        action: 'addCategory',
        category
      });
      if (data && data.status === 'success') {
        return { success: true, message: 'Category added to Google Sheet' };
      }
      return { success: false, message: data.message || 'Failed to add category', error: data.message };
    } catch (err: any) {
      return { success: false, message: err.message, error: err.message };
    }
  },

  /**
   * Update an existing category in Google Sheet
   */
  async updateCategory(scriptUrl: string, category: Category): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'POST', {
        action: 'updateCategory',
        category
      });
      if (data && data.status === 'success') {
        return { success: true, message: 'Category updated in Google Sheet' };
      }
      return { success: false, message: data.message || 'Failed to update category', error: data.message };
    } catch (err: any) {
      return { success: false, message: err.message, error: err.message };
    }
  },

  /**
   * Delete category from Google Sheet
   */
  async deleteCategory(scriptUrl: string, categoryId: string): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'POST', {
        action: 'deleteCategory',
        CategoryID: categoryId
      });
      if (data && data.status === 'success') {
        return { success: true, message: 'Category deleted from Google Sheet' };
      }
      return { success: false, message: data.message || 'Failed to delete category', error: data.message };
    } catch (err: any) {
      return { success: false, message: err.message, error: err.message };
    }
  },

  /**
   * Batch sync categories
   */
  async batchSyncCategories(scriptUrl: string, categories: Category[]): Promise<SyncResult> {
    try {
      const data = await callAppsScript(scriptUrl, 'POST', {
        action: 'batchSyncCategories',
        categories
      });
      if (data && data.status === 'success') {
        return { success: true, message: `Synced ${categories.length} categories to Google Sheet.` };
      }
      return { success: false, message: data.message || 'Categories batch sync failed', error: data.message };
    } catch (err: any) {
      return { success: false, message: err.message, error: err.message };
    }
  },

  /**
   * Local storage helpers for immediate responsive offline experience
   */
  loadLocalProducts(): Product[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read products from localStorage', e);
    }
    return null;
  },

  saveLocalProducts(products: Product[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  },

  loadLocalCategories(): Category[] | null {
    try {
      const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read categories from localStorage', e);
    }
    return null;
  },

  saveLocalCategories(categories: Category[]) {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  },

  loadConfig(): { webAppUrl: string; autoSync: boolean } {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load config', e);
    }
    return { webAppUrl: '', autoSync: true };
  },

  saveConfig(config: { webAppUrl: string; autoSync: boolean }) {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config', e);
    }
  },

  /**
   * Export products to standard CSV
   */
  exportToCsv(products: Product[], filename = 'stockpulse_products.csv') {
    const headers = ['ProductID', 'ProductName', 'CategoryID', 'CostPrice', 'SalePrice', 'Stock', 'Status', 'MinStock', 'LastUpdated', 'Notes'];
    const rows = products.map(p => [
      `"${p.ProductID}"`,
      `"${(p.ProductName || '').replace(/"/g, '""')}"`,
      `"${p.CategoryID}"`,
      p.CostPrice.toFixed(2),
      p.SalePrice.toFixed(2),
      p.Stock,
      `"${p.Status}"`,
      p.MinStock ?? 10,
      `"${p.LastUpdated || new Date().toISOString()}"`,
      `"${(p.Notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export categories to standard CSV
   */
  exportCategoriesToCsv(categories: Category[], filename = 'stockpulse_categories.csv') {
    const headers = ['CategoryID', 'CategoryName', 'Note'];
    const rows = categories.map(c => [
      `"${c.CategoryID}"`,
      `"${(c.CategoryName || '').replace(/"/g, '""')}"`,
      `"${(c.Note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
