import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, DollarSign, Package } from 'lucide-react';
import { Product, ProductStatus } from '../types/product';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void> | void;
  productToEdit?: Product | null;
  existingCategories: string[];
  existingProductIds: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  existingCategories,
  existingProductIds,
}) => {
  const isEditing = !!productToEdit;

  // Form states
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [costPrice, setCostPrice] = useState<string>('0.00');
  const [salePrice, setSalePrice] = useState<string>('0.00');
  const [stock, setStock] = useState<string>('0');
  const [status, setStatus] = useState<ProductStatus>('In Stock');
  const [minStock, setMinStock] = useState<string>('10');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate unique next product ID
  const generateNextId = () => {
    let nextNum = 1001;
    while (existingProductIds.includes(`PRD-${nextNum}`)) {
      nextNum++;
    }
    setProductId(`PRD-${nextNum}`);
  };

  // Sync state when editing or opening
  useEffect(() => {
    if (productToEdit) {
      setProductId(productToEdit.ProductID);
      setProductName(productToEdit.ProductName);
      setCategoryId(productToEdit.CategoryID);
      setCustomCategory('');
      setCostPrice(productToEdit.CostPrice.toString());
      setSalePrice(productToEdit.SalePrice.toString());
      setStock(productToEdit.Stock.toString());
      setStatus(productToEdit.Status);
      setMinStock((productToEdit.MinStock ?? 10).toString());
      setNotes(productToEdit.Notes || '');
      setError(null);
    } else {
      generateNextId();
      setProductName('');
      setCategoryId(existingCategories[0] || 'Electronics');
      setCustomCategory('');
      setCostPrice('25.00');
      setSalePrice('49.99');
      setStock('20');
      setStatus('In Stock');
      setMinStock('10');
      setNotes('');
      setError(null);
    }
  }, [productToEdit, isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-suggest status when stock changes
  const handleStockChange = (newStockVal: string) => {
    setStock(newStockVal);
    const numStock = parseInt(newStockVal, 10);
    const numMin = parseInt(minStock, 10) || 10;

    if (!isNaN(numStock)) {
      if (numStock === 0) {
        setStatus('Out of Stock');
      } else if (numStock <= numMin) {
        setStatus('Low Stock');
      } else {
        setStatus('In Stock');
      }
    }
  };

  if (!isOpen) return null;

  // Real-time calculations
  const numCost = parseFloat(costPrice) || 0;
  const numSale = parseFloat(salePrice) || 0;
  const numStock = parseInt(stock, 10) || 0;
  const profit = numSale - numCost;
  const margin = numSale > 0 ? (profit / numSale) * 100 : 0;
  const totalCostBatch = numCost * numStock;
  const totalRetailBatch = numSale * numStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = productId.trim().toUpperCase();
    const cleanName = productName.trim();
    const finalCategory = categoryId === '__custom__' ? customCategory.trim() : categoryId.trim();

    if (!cleanId) {
      setError('Product ID is required.');
      return;
    }

    if (!isEditing && existingProductIds.includes(cleanId)) {
      setError(`Product ID "${cleanId}" already exists. Please choose a unique ID.`);
      return;
    }

    if (!cleanName) {
      setError('Product Name is required.');
      return;
    }

    if (!finalCategory) {
      setError('Please specify a Category.');
      return;
    }

    if (numCost < 0 || numSale < 0) {
      setError('Prices cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      const productPayload: Product = {
        ProductID: cleanId,
        ProductName: cleanName,
        CategoryID: finalCategory,
        CostPrice: numCost,
        SalePrice: numSale,
        Stock: Math.max(0, numStock),
        Status: status,
        MinStock: Math.max(0, parseInt(minStock, 10) || 10),
        LastUpdated: new Date().toISOString(),
        Notes: notes.trim(),
      };

      await onSave(productPayload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-2xl w-full overflow-hidden transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isEditing ? `Modifying item #${productId}` : 'Create a new catalog SKU synced with Google Sheets'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Product ID <span className="text-red-600">*</span>
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={generateNextId}
                    className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-ID</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={productId}
                disabled={isEditing}
                onChange={(e) => setProductId(e.target.value.toUpperCase())}
                placeholder="e.g. PRD-1015"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 bg-white"
              >
                {existingCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">+ Add Custom Category...</option>
              </select>

              {categoryId === '__custom__' && (
                <input
                  type="text"
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  required
                />
              )}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Product Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Ergonomic Low-Profile Keyboard"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              required
            />
          </div>

          {/* Pricing & Margin Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Cost Price */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                required
              />
            </div>

            {/* Sale Price */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Sale Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                required
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Stock (Units)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={stock}
                onChange={(e) => handleStockChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                required
              />
            </div>

            {/* Min Stock Alert */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Min Stock Alert
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Product Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'] as ProductStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                    status === st
                      ? 'border-red-600 bg-red-50 text-red-700 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Profit & Margin Calculator Card */}
          <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200/80">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Financial & Margin Preview
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
              <div>
                <span className="text-neutral-500 block text-[11px] font-sans">Unit Profit:</span>
                <span className="font-bold text-neutral-900">${profit.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px] font-sans">Gross Margin:</span>
                <span className={`font-bold ${margin >= 40 ? 'text-emerald-700' : 'text-neutral-900'}`}>
                  {margin.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px] font-sans">Batch Cost:</span>
                <span className="font-bold text-neutral-900">${totalCostBatch.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px] font-sans">Retail Potential:</span>
                <span className="font-bold text-red-600">${totalRetailBatch.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Specifications & Warehouse Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shelf B4, includes extra accessories, manufacturer warranty."
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
