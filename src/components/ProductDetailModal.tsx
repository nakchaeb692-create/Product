import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  DollarSign, 
  Layers, 
  TrendingUp, 
  Clock, 
  Barcode, 
  AlertTriangle 
} from 'lucide-react';
import { Product } from '../types/product';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (product: Product) => void;
  onOpenDelete: (product: Product) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenEdit,
  onOpenDelete,
  onUpdateStock,
}) => {
  const [copied, setCopied] = useState(false);
  const [customStockInput, setCustomStockInput] = useState('');

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(product.ProductID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const profit = product.SalePrice - product.CostPrice;
  const margin = product.SalePrice > 0 ? (profit / product.SalePrice) * 100 : 0;
  const totalCostValuation = product.CostPrice * product.Stock;
  const totalRetailValuation = product.SalePrice * product.Stock;
  const minStock = product.MinStock ?? 10;

  const handleApplyCustomStock = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customStockInput, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateStock(product.ProductID, val);
      setCustomStockInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-xl w-full overflow-hidden transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1">
                {product.ProductID}
                <button
                  onClick={handleCopyId}
                  className="text-neutral-400 hover:text-neutral-700 ml-1"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs font-semibold text-neutral-600">
                {product.CategoryID}
              </span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 leading-snug">
              {product.ProductName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Status Badge & Health Indicator */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500">Inventory Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  product.Status === 'In Stock'
                    ? 'bg-emerald-100 text-emerald-800'
                    : product.Status === 'Low Stock'
                    ? 'bg-amber-100 text-amber-900'
                    : product.Status === 'Out of Stock'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                {product.Status}
              </span>
            </div>

            <div className="text-xs font-mono text-neutral-600 tabular-nums">
              Safety Min: <span className="font-bold text-neutral-900">{minStock} units</span>
            </div>
          </div>

          {/* Financial Breakdown Grid */}
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">
              Unit Economics & Profitability
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                <span className="text-[11px] text-neutral-500 block">Wholesale Cost</span>
                <span className="text-sm font-bold font-mono tabular-nums text-neutral-800">
                  ${product.CostPrice.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                <span className="text-[11px] text-neutral-500 block">Retail Sale Price</span>
                <span className="text-sm font-bold font-mono tabular-nums text-neutral-900">
                  ${product.SalePrice.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                <span className="text-[11px] text-neutral-500 block">Unit Net Profit</span>
                <span className="text-sm font-bold font-mono tabular-nums text-red-600">
                  +${profit.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                <span className="text-[11px] text-neutral-500 block">Profit Margin</span>
                <span className={`text-sm font-bold font-mono tabular-nums ${margin >= 40 ? 'text-emerald-700' : 'text-neutral-900'}`}>
                  {margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Batch Inventory Valuation */}
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">
              Stock Valuation ({product.Stock} units in warehouse)
            </span>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs tabular-nums">
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                <span className="text-[11px] font-sans text-neutral-500 block">Invested Stock Cost</span>
                <span className="text-base font-bold text-neutral-900">
                  ${totalCostValuation.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                <span className="text-[11px] font-sans text-neutral-500 block">Potential Retail Yield</span>
                <span className="text-base font-bold text-red-600">
                  ${totalRetailValuation.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Fast Quick Stock Adjustment */}
          <div className="p-4 border border-neutral-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900">
                Quick Inventory Adjuster
              </span>
              <span className="font-mono tabular-nums text-neutral-500">
                Current: <strong className="text-neutral-900 text-sm">{product.Stock}</strong> units
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onUpdateStock(product.ProductID, Math.max(0, product.Stock - 5))}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
              >
                -5
              </button>
              <button
                onClick={() => onUpdateStock(product.ProductID, Math.max(0, product.Stock - 1))}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
              >
                -1
              </button>
              <button
                onClick={() => onUpdateStock(product.ProductID, product.Stock + 1)}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
              >
                +1
              </button>
              <button
                onClick={() => onUpdateStock(product.ProductID, product.Stock + 5)}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
              >
                +5
              </button>
              <button
                onClick={() => onUpdateStock(product.ProductID, product.Stock + 20)}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                +20
              </button>

              {/* Set Exact Stock Form */}
              <form onSubmit={handleApplyCustomStock} className="flex items-center gap-1.5 ml-auto">
                <input
                  type="number"
                  min="0"
                  placeholder="Set exact"
                  value={customStockInput}
                  onChange={(e) => setCustomStockInput(e.target.value)}
                  className="w-20 px-2 py-1 text-xs font-mono rounded border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="submit"
                  disabled={!customStockInput}
                  className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 disabled:opacity-40"
                >
                  Set
                </button>
              </form>
            </div>
          </div>

          {/* Barcode Mock Visual */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-500">
              <Barcode className="w-5 h-5" />
              <span className="text-xs font-mono">BARCODE SKU: 7894-0{product.ProductID.replace(/[^0-9]/g, '')}-8</span>
            </div>
            {product.LastUpdated && (
              <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>Updated {new Date(product.LastUpdated).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {product.Notes && (
            <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200/80">
              <span className="font-semibold text-neutral-800 block mb-0.5">Notes:</span>
              <p>{product.Notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenDelete(product);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Product</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200/70 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenEdit(product);
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
