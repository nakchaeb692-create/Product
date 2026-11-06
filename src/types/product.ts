export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued';

export interface Product {
  ProductID: string;
  ProductName: string;
  CategoryID: string;
  CostPrice: number;
  SalePrice: number;
  Stock: number;
  Status: ProductStatus;
  MinStock?: number;
  LastUpdated?: string;
  Notes?: string;
}

export interface Category {
  CategoryID: string;
  CategoryName: string;
  Note?: string;
  CreatedAt?: string;
}

export interface CategorySummary {
  category: string;
  count: number;
  totalStock: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  averageMargin: number;
}

export interface InventoryMetrics {
  totalProducts: number;
  totalStockUnits: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  overallMargin: number;
  lowStockCount: number;
  outOfStockCount: number;
  healthyStockCount: number;
}

export type SortField = 'ProductID' | 'ProductName' | 'CategoryID' | 'CostPrice' | 'SalePrice' | 'Stock' | 'Status' | 'Margin';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  category: string;
  status: string;
  stockLevel: 'all' | 'healthy' | 'low' | 'out';
  minPrice?: number;
  maxPrice?: number;
}

export interface AppsScriptConfig {
  webAppUrl: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncTime: string | null;
  sheetName: string;
}
