import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react';
import { Product, InventoryMetrics, CategorySummary } from '../types/product';

interface StockSummaryViewProps {
  products: Product[];
  metrics: InventoryMetrics;
  categorySummaries: CategorySummary[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onViewProduct: (product: Product) => void;
  onExportCsv: (selectedOnly?: boolean, selectedIds?: string[]) => void;
}

export const StockSummaryView: React.FC<StockSummaryViewProps> = ({
  products,
  metrics,
  categorySummaries,
  onUpdateStock,
  onViewProduct,
  onExportCsv,
}) => {
  // Urgent items needing restocking (Stock <= MinStock)
  const lowOrEmptyItems = products
    .filter(p => p.Status === 'Low Stock' || p.Status === 'Out of Stock' || p.Stock <= (p.MinStock ?? 10))
    .sort((a, b) => a.Stock - b.Stock);

  // Calculate restock needs
  const totalRestockUnitsNeeded = lowOrEmptyItems.reduce((acc, p) => {
    const targetStock = (p.MinStock ?? 10) * 2;
    return acc + Math.max(0, targetStock - p.Stock);
  }, 0);

  const totalEstimatedRestockCost = lowOrEmptyItems.reduce((acc, p) => {
    const targetStock = (p.MinStock ?? 10) * 2;
    const units = Math.max(0, targetStock - p.Stock);
    return acc + (units * p.CostPrice);
  }, 0);

  // Quick export reorder list
  const handleExportReorderList = () => {
    const headers = ['ProductID', 'ProductName', 'CategoryID', 'CurrentStock', 'MinStock', 'UnitsToOrder', 'UnitCost', 'EstimatedTotalCost'];
    const rows = lowOrEmptyItems.map(p => {
      const targetStock = (p.MinStock ?? 10) * 2;
      const units = Math.max(0, targetStock - p.Stock);
      return [
        `"${p.ProductID}"`,
        `"${p.ProductName.replace(/"/g, '""')}"`,
        `"${p.CategoryID}"`,
        p.Stock,
        p.MinStock ?? 10,
        units,
        p.CostPrice.toFixed(2),
        (units * p.CostPrice).toFixed(2)
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stockpulse_reorder_sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Stock & Inventory Health Summary
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Monitor inventory buffer thresholds, restock requirements, and category valuations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lowOrEmptyItems.length > 0 && (
            <button
              onClick={handleExportReorderList}
              className="px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Reorder List (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Stock Health KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Healthy Inventory</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {metrics.healthyStockCount} items
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">Stock &gt; Minimum Threshold</div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Low Stock Warnings</div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            {metrics.lowStockCount} items
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">Stock ≤ Min Threshold</div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Critical Stockouts</div>
          <div className="text-2xl font-bold text-red-600 font-mono tabular-nums mt-1">
            {metrics.outOfStockCount} items
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">0 Units in warehouse</div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Estimated Reorder Budget</div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            ${totalEstimatedRestockCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">{totalRestockUnitsNeeded} units to replenish</div>
        </div>
      </div>

      {/* Section 1: Urgent Reorder Table */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <span>Urgent Restock Action Plan</span>
              <span className="text-xs font-mono tabular-nums px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold">
                {lowOrEmptyItems.length} Products
              </span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Items at or below safety stock threshold. Calculated to restore a 2x minimum buffer.
            </p>
          </div>
        </div>

        {lowOrEmptyItems.length > 0 ? (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-xs">
                <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500 shadow-2xs">
                  <th className="py-2.5 px-3">Product ID</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Current Stock</th>
                  <th className="py-2.5 px-3 text-center">Min Threshold</th>
                  <th className="py-2.5 px-3 text-center font-bold text-red-700">Units Needed</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Est. Cost</th>
                  <th className="py-2.5 px-3 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {lowOrEmptyItems.map((p) => {
                  const targetStock = (p.MinStock ?? 10) * 2;
                  const unitsToOrder = Math.max(0, targetStock - p.Stock);
                  const costTotal = unitsToOrder * p.CostPrice;

                  return (
                    <tr key={p.ProductID} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs font-semibold text-neutral-800">
                        {p.ProductID}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onViewProduct(p)}
                          className="font-semibold text-neutral-900 hover:text-red-600 transition-colors text-left"
                        >
                          {p.ProductName}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-xs text-neutral-600">
                        {p.CategoryID}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold">
                        <span className={p.Stock === 0 ? 'text-red-600' : 'text-amber-800'}>
                          {p.Stock}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs text-neutral-500 tabular-nums">
                        {p.MinStock ?? 10}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs font-bold text-red-700 tabular-nums">
                        +{unitsToOrder}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-neutral-600 tabular-nums">
                        ${p.CostPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-neutral-900 tabular-nums">
                        ${costTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateStock(p.ProductID, p.Stock + 10)}
                            className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:border-red-400 hover:text-red-600 rounded transition-colors shadow-2xs"
                            title="Restock +10 units"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.ProductID, p.Stock + unitsToOrder)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors shadow-2xs"
                            title={`Restock +${unitsToOrder} to reach 2x safety buffer`}
                          >
                            Fill (+{unitsToOrder})
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900">
              All inventory levels are currently healthy!
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Every active product exceeds its defined minimum stock threshold.
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Category Valuation Matrix */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Category Valuation & Inventory Weight Matrix
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Comprehensive overview of total stock volume and capital distribution by department
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-xs">
              <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500 shadow-2xs">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">SKU Count</th>
                <th className="py-2.5 px-3 text-center">Total Units</th>
                <th className="py-2.5 px-3 text-right">Cost Valuation</th>
                <th className="py-2.5 px-3 text-right">Retail Potential</th>
                <th className="py-2.5 px-3 text-right">Gross Profit</th>
                <th className="py-2.5 px-3 text-right">Avg Margin</th>
                <th className="py-2.5 px-3 text-right">% of Catalog</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {categorySummaries.map((cat) => {
                const catalogShare = metrics.totalRetailValue > 0
                  ? ((cat.totalRetailValue / metrics.totalRetailValue) * 100).toFixed(1)
                  : '0.0';

                return (
                  <tr key={cat.category} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-neutral-900">
                      {cat.category}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-xs tabular-nums text-neutral-700">
                      {cat.count}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-xs font-semibold tabular-nums text-neutral-900">
                      {cat.totalStock.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-neutral-600 tabular-nums">
                      ${cat.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-neutral-900 tabular-nums">
                      ${cat.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-red-600 font-semibold tabular-nums">
                      ${cat.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs tabular-nums">
                      <span className={cat.averageMargin >= 40 ? 'text-emerald-700 font-semibold' : 'text-neutral-700'}>
                        {cat.averageMargin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-neutral-500 tabular-nums">
                      {catalogShare}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-300 font-semibold text-xs text-neutral-900 bg-neutral-50/80">
                <td className="py-3 px-3">Total Inventory Portfolio</td>
                <td className="py-3 px-3 text-center font-mono tabular-nums">{metrics.totalProducts}</td>
                <td className="py-3 px-3 text-center font-mono tabular-nums">{metrics.totalStockUnits.toLocaleString()}</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  ${metrics.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  ${metrics.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono text-red-600 tabular-nums">
                  ${metrics.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">{metrics.overallMargin.toFixed(1)}%</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
