import React from 'react';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Layers, 
  Plus, 
  Download,
  Percent
} from 'lucide-react';
import { Product, InventoryMetrics, CategorySummary } from '../types/product';

interface DashboardViewProps {
  products: Product[];
  metrics: InventoryMetrics;
  categorySummaries: CategorySummary[];
  onNavigateToProducts: (filterStatus?: string) => void;
  onNavigateToStock: () => void;
  onNavigateToCharts: () => void;
  onOpenAddModal: () => void;
  onOpenSheetsModal: () => void;
  onViewProduct: (product: Product) => void;
  onExportCsv: () => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  isConnected: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  metrics,
  categorySummaries,
  onNavigateToProducts,
  onNavigateToStock,
  onNavigateToCharts,
  onOpenAddModal,
  onOpenSheetsModal,
  onViewProduct,
  onExportCsv,
  onUpdateStock,
  isConnected,
}) => {
  // Identify low stock and out of stock items
  const criticalItems = products.filter(p => p.Status === 'Out of Stock' || p.Status === 'Low Stock');
  const recentProducts = [...products].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome / Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Inventory & Catalog Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Real-time synchronization with Google Sheets backend and Apps Script API.
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
            title="Download full catalog CSV"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenSheetsModal}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-red-600" />
            <span>{isConnected ? 'Sheets Live' : 'Connect Sheets'}</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Setup Callout Banner (when not connected) */}
      {!isConnected && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Connect your Google Sheet &amp; Apps Script Backend
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Enable cloud sync so every add, edit, and stock change saves directly to your Google Spreadsheet.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSheetsModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-end sm:self-center shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Setup Google Sheets Guide</span>
          </button>
        </div>
      )}

      {/* Critical Stock Alert Banner (if any item is Low or Out of Stock) */}
      {criticalItems.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-red-950">
                Action Required: {metrics.outOfStockCount} Out of Stock, {metrics.lowStockCount} Low Stock Items
              </h2>
              <p className="text-xs text-red-800/80 mt-0.5">
                Replenish inventory to avoid fulfillment delays and stockouts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => onNavigateToStock()}
              className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Review Reorders
            </button>
            <button
              onClick={() => onNavigateToProducts('Low Stock')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Filter Low Stock
            </button>
          </div>
        </div>
      )}

      {/* 6 Core KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1: Total Products */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Total Products</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            {metrics.totalProducts}
          </div>
          <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
            <span>{categorySummaries.length} categories</span>
          </div>
        </div>

        {/* Metric 2: Total Units */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Units in Stock</span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            {metrics.totalStockUnits.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            <span>Units available</span>
          </div>
        </div>

        {/* Metric 3: Total Cost Value */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Inventory Cost</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            ${metrics.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            <span>Capital invested</span>
          </div>
        </div>

        {/* Metric 4: Potential Retail Value */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Retail Value</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            ${metrics.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            <span>At listed sale price</span>
          </div>
        </div>

        {/* Metric 5: Projected Profit */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Projected Profit</span>
            <DollarSign className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-red-600 font-mono tabular-nums">
            ${metrics.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            <span>Unrealized margin</span>
          </div>
        </div>

        {/* Metric 6: Overall Margin % */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Avg Profit Margin</span>
            <Percent className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            {metrics.overallMargin.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            <span>Net spread</span>
          </div>
        </div>
      </div>

      {/* Mid Section: Category Distribution & Stock Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Valuation Overview */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Category Inventory Valuation
              </h2>
              <p className="text-xs text-neutral-500">
                Breakdown of stock units and retail values across active categories
              </p>
            </div>
            <button
              onClick={onNavigateToCharts}
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <span>View Charts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {categorySummaries.map((cat) => {
              const percentageOfTotalValue = metrics.totalRetailValue > 0
                ? Math.round((cat.totalRetailValue / metrics.totalRetailValue) * 100)
                : 0;

              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">{cat.category}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500 font-mono tabular-nums">{cat.count} items</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500 font-mono tabular-nums">{cat.totalStock} units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 font-mono tabular-nums">
                        ${cat.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-neutral-400 font-mono text-[11px] tabular-nums">
                        ({percentageOfTotalValue}%)
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(percentageOfTotalValue, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Inventory Health Breakdown */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Stock Health Status
                </h2>
                <p className="text-xs text-neutral-500">
                  Current distribution across availability tiers
                </p>
              </div>
              <button
                onClick={onNavigateToStock}
                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <span>Full Summary</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Healthy */}
              <button
                onClick={() => onNavigateToProducts('In Stock')}
                className="w-full p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 group-hover:text-red-600 transition-colors">
                      In Stock / Healthy
                    </span>
                    <p className="text-[11px] text-neutral-500">Adequate inventory buffer</p>
                  </div>
                </div>
                <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                  {metrics.healthyStockCount}
                </span>
              </button>

              {/* Low Stock */}
              <button
                onClick={() => onNavigateToProducts('Low Stock')}
                className="w-full p-3 rounded-lg border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-950 group-hover:text-amber-800 transition-colors">
                      Low Stock Warning
                    </span>
                    <p className="text-[11px] text-amber-700">At or below reorder threshold</p>
                  </div>
                </div>
                <span className="text-base font-bold text-amber-800 font-mono tabular-nums">
                  {metrics.lowStockCount}
                </span>
              </button>

              {/* Out of Stock */}
              <button
                onClick={() => onNavigateToProducts('Out of Stock')}
                className="w-full p-3 rounded-lg border border-red-200/80 bg-red-50/40 hover:bg-red-50 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-red-950 group-hover:text-red-700 transition-colors">
                      Out of Stock
                    </span>
                    <p className="text-[11px] text-red-700">0 units remaining in warehouse</p>
                  </div>
                </div>
                <span className="text-base font-bold text-red-700 font-mono tabular-nums">
                  {metrics.outOfStockCount}
                </span>
              </button>
            </div>
          </div>

          {/* Quick link to Google Sheets Backend */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Database Backend:</span>
            <button
              onClick={onOpenSheetsModal}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
            >
              {isConnected ? 'Google Sheets (Syncing)' : 'Connect Google Sheets'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Products Quick Catalog */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Recent Product Catalog Overview
            </h2>
            <p className="text-xs text-neutral-500">
              Quick access to product prices, margins, and inline stock adjustments
            </p>
          </div>
          <button
            onClick={() => onNavigateToProducts()}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <span>View All Products</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-xs">
              <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500 shadow-2xs">
                <th className="py-2.5 px-3">Product ID</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Cost</th>
                <th className="py-2.5 px-3 text-right">Sale Price</th>
                <th className="py-2.5 px-3 text-right">Margin</th>
                <th className="py-2.5 px-3 text-center">Stock</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {recentProducts.map((p) => {
                const profit = p.SalePrice - p.CostPrice;
                const margin = p.SalePrice > 0 ? (profit / p.SalePrice) * 100 : 0;

                return (
                  <tr key={p.ProductID} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-neutral-700">
                      {p.ProductID}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onViewProduct(p)}
                        className="text-left font-medium text-neutral-900 hover:text-red-600 transition-colors"
                      >
                        {p.ProductName}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-xs text-neutral-600">
                      {p.CategoryID}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-neutral-600 tabular-nums">
                      ${p.CostPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-neutral-900 tabular-nums">
                      ${p.SalePrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs tabular-nums">
                      <span className={margin >= 40 ? 'text-emerald-700 font-semibold' : 'text-neutral-700'}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums">
                        <button
                          onClick={() => onUpdateStock(p.ProductID, Math.max(0, p.Stock - 1))}
                          className="w-5 h-5 rounded border border-neutral-200 text-neutral-600 hover:border-red-400 hover:text-red-600 flex items-center justify-center font-sans text-xs transition-colors"
                          title="Decrease stock by 1"
                        >
                          -
                        </button>
                        <span className={`px-1.5 font-semibold ${p.Stock === 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                          {p.Stock}
                        </span>
                        <button
                          onClick={() => onUpdateStock(p.ProductID, p.Stock + 1)}
                          className="w-5 h-5 rounded border border-neutral-200 text-neutral-600 hover:border-red-400 hover:text-red-600 flex items-center justify-center font-sans text-xs transition-colors"
                          title="Increase stock by 1"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          p.Status === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-800'
                            : p.Status === 'Low Stock'
                            ? 'bg-amber-50 text-amber-800'
                            : p.Status === 'Out of Stock'
                            ? 'bg-red-50 text-red-700 font-semibold'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {p.Status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onViewProduct(p)}
                        className="text-xs font-medium text-neutral-600 hover:text-red-600 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
