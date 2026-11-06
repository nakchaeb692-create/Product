import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Percent, 
  ArrowUpRight 
} from 'lucide-react';
import { Product, InventoryMetrics, CategorySummary } from '../types/product';

interface ChartsViewProps {
  products: Product[];
  metrics: InventoryMetrics;
  categorySummaries: CategorySummary[];
  onViewProduct: (product: Product) => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  products,
  metrics,
  categorySummaries,
  onViewProduct,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'valuation' | 'status' | 'margins' | 'pricing'>('valuation');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Status breakdown data
  const statusCounts = {
    inStock: products.filter(p => p.Status === 'In Stock').length,
    lowStock: products.filter(p => p.Status === 'Low Stock').length,
    outOfStock: products.filter(p => p.Status === 'Out of Stock').length,
    discontinued: products.filter(p => p.Status === 'Discontinued').length,
  };

  const totalStatusProducts = products.length || 1;
  const statusSlices = [
    { label: 'In Stock', count: statusCounts.inStock, color: '#16A34A', percentage: Math.round((statusCounts.inStock / totalStatusProducts) * 100) },
    { label: 'Low Stock', count: statusCounts.lowStock, color: '#D97706', percentage: Math.round((statusCounts.lowStock / totalStatusProducts) * 100) },
    { label: 'Out of Stock', count: statusCounts.outOfStock, color: '#DC2626', percentage: Math.round((statusCounts.outOfStock / totalStatusProducts) * 100) },
    { label: 'Discontinued', count: statusCounts.discontinued, color: '#737373', percentage: Math.round((statusCounts.discontinued / totalStatusProducts) * 100) },
  ].filter(s => s.count > 0);

  // Highest margin products (top 8)
  const topMarginProducts = [...products]
    .map(p => {
      const margin = p.SalePrice > 0 ? ((p.SalePrice - p.CostPrice) / p.SalePrice) * 100 : 0;
      const profit = p.SalePrice - p.CostPrice;
      return { ...p, margin, profit };
    })
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 8);

  // Category valuation max for scaling
  const maxCategoryRetail = Math.max(...categorySummaries.map(c => c.totalRetailValue), 100);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Catalog & Inventory Analytics
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Visual metrics covering valuation, status distribution, profit spreads, and pricing structures.
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveChartTab('valuation')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeChartTab === 'valuation'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Valuation by Category
          </button>
          <button
            onClick={() => setActiveChartTab('status')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeChartTab === 'status'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Stock Health
          </button>
          <button
            onClick={() => setActiveChartTab('margins')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeChartTab === 'margins'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Profit Margins
          </button>
          <button
            onClick={() => setActiveChartTab('pricing')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeChartTab === 'pricing'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Cost vs Sale
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-xl p-12 text-center shadow-xs">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              No product analytics available
            </h3>
            <p className="text-xs text-neutral-500">
              Add products to your catalog to generate valuation, stock distribution, and profit margin charts.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Chart Area Based on activeChartTab */}
          {activeChartTab === 'valuation' && (
        <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">
                Inventory Valuation by Category (Cost vs. Retail Potential)
              </h2>
              <p className="text-xs text-neutral-500">
                Red indicates inventory cost (invested capital); dark neutral indicates potential retail yield.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-600 inline-block" />
                <span className="text-neutral-700">Cost Value (Capital)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-neutral-800 inline-block" />
                <span className="text-neutral-700">Retail Value (Potential)</span>
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="space-y-5 pt-2">
            {categorySummaries.map((cat, idx) => {
              const costPct = (cat.totalCostValue / maxCategoryRetail) * 100;
              const retailPct = (cat.totalRetailValue / maxCategoryRetail) * 100;

              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900 w-44 truncate">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                      <span className="text-red-700">
                        Cost: ${cat.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-neutral-900 font-bold">
                        Retail: ${cat.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        +{cat.averageMargin.toFixed(0)}% Margin
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar Track */}
                  <div className="space-y-1">
                    {/* Cost Bar */}
                    <div className="w-full bg-neutral-100 rounded h-2.5 overflow-hidden flex">
                      <div
                        className="bg-red-600 h-full rounded transition-all duration-300"
                        style={{ width: `${Math.max(costPct, 2)}%` }}
                        title={`Cost: $${cat.totalCostValue.toFixed(2)}`}
                      />
                    </div>
                    {/* Retail Bar */}
                    <div className="w-full bg-neutral-100 rounded h-2.5 overflow-hidden flex">
                      <div
                        className="bg-neutral-800 h-full rounded transition-all duration-300"
                        style={{ width: `${Math.max(retailPct, 2)}%` }}
                        title={`Retail: $${cat.totalRetailValue.toFixed(2)}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeChartTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart Visual */}
          <div className="lg:col-span-1 bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 self-start">
              Status Proportions
            </h2>
            
            {/* SVG Donut */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let accumulatedPercent = 0;
                  return statusSlices.map((slice, index) => {
                    const strokeDasharray = `${slice.percentage} ${100 - slice.percentage}`;
                    const strokeDashoffset = -accumulatedPercent;
                    accumulatedPercent += slice.percentage;

                    return (
                      <circle
                        key={slice.label}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300"
                        pathLength="100"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                  {metrics.totalProducts}
                </span>
                <span className="text-[11px] text-neutral-500">Total Products</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Legend & Details */}
          <div className="lg:col-span-2 bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
              Inventory State Analysis
            </h2>

            <div className="space-y-3">
              {statusSlices.map((slice) => (
                <div key={slice.label} className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <div>
                      <span className="text-xs font-semibold text-neutral-900">{slice.label}</span>
                      <p className="text-[11px] text-neutral-500">
                        {slice.label === 'In Stock' && 'Sufficient units for normal operations'}
                        {slice.label === 'Low Stock' && 'Stock is at or below recommended minimum threshold'}
                        {slice.label === 'Out of Stock' && 'Currently depleted; requires restock'}
                        {slice.label === 'Discontinued' && 'Archived from future purchasing orders'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <span className="text-base font-bold font-mono tabular-nums text-neutral-900">
                      {slice.count}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-neutral-500 w-12">
                      ({slice.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeChartTab === 'margins' && (
        <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-900">
              Top Products by Profit Margin (%)
            </h2>
            <p className="text-xs text-neutral-500">
              High-yield catalog items ranked by gross margin percentage
            </p>
          </div>

          <div className="space-y-4">
            {topMarginProducts.map((p) => {
              const marginPct = Math.min(100, Math.max(0, p.margin));

              return (
                <div
                  key={p.ProductID}
                  onClick={() => onViewProduct(p)}
                  className="p-3 rounded-lg border border-neutral-200 hover:border-red-300 hover:bg-neutral-50/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-neutral-600 group-hover:text-red-600 transition-colors">
                        {p.ProductID}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                        {p.ProductName}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500">{p.CategoryID}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums text-xs">
                      <span className="text-neutral-600">Cost: ${p.CostPrice.toFixed(2)}</span>
                      <span className="text-neutral-900 font-semibold">Sale: ${p.SalePrice.toFixed(2)}</span>
                      <span className="text-emerald-700 font-bold text-sm">
                        {p.margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${marginPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeChartTab === 'pricing' && (
        <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-900">
              Pricing Spread & Break-Even Analysis
            </h2>
            <p className="text-xs text-neutral-500">
              Spread between wholesale acquisition cost and retail sales price across catalog
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-semibold">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Cost Price</th>
                  <th className="py-2.5 px-3 text-right">Sale Price</th>
                  <th className="py-2.5 px-3 text-right">Unit Profit</th>
                  <th className="py-2.5 px-3 text-right">Markup Multiple</th>
                  <th className="py-2.5 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => {
                  const profit = p.SalePrice - p.CostPrice;
                  const margin = p.SalePrice > 0 ? (profit / p.SalePrice) * 100 : 0;
                  const markup = p.CostPrice > 0 ? (p.SalePrice / p.CostPrice).toFixed(2) : '-';

                  return (
                    <tr
                      key={p.ProductID}
                      onClick={() => onViewProduct(p)}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-neutral-500 font-semibold mr-2">{p.ProductID}</span>
                        <span className="font-semibold text-neutral-900">{p.ProductName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-600 tabular-nums">
                        ${p.CostPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-900 font-bold tabular-nums">
                        ${p.SalePrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-red-600 font-bold tabular-nums">
                        +${profit.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-700 tabular-nums">
                        {markup}x
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums">
                        <span className={margin >= 40 ? 'text-emerald-700' : 'text-neutral-800'}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
