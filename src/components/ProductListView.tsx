import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Eye, 
  Edit3, 
  ArrowUpDown, 
  Copy, 
  Check, 
  RotateCcw,
  Package,
  Layers
} from 'lucide-react';
import { Product, SortField, SortOrder, FilterState } from '../types/product';

interface ProductListViewProps {
  products: Product[];
  categories: string[];
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onOpenDeleteModal: (product: Product) => void;
  onOpenBulkDeleteModal: (productIds: string[]) => void;
  onViewProduct: (product: Product) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onExportCsv: (selectedOnly?: boolean, selectedIds?: string[]) => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  categories,
  filterState,
  onUpdateFilter,
  onResetFilters,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenBulkDeleteModal,
  onViewProduct,
  onUpdateStock,
  onExportCsv,
}) => {
  const [sortField, setSortField] = useState<SortField>('ProductID');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Copy Product ID
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search filter
      if (filterState.search.trim()) {
        const query = filterState.search.toLowerCase().trim();
        const matchesId = p.ProductID.toLowerCase().includes(query);
        const matchesName = p.ProductName.toLowerCase().includes(query);
        const matchesCat = p.CategoryID.toLowerCase().includes(query);
        const matchesNotes = (p.Notes || '').toLowerCase().includes(query);
        if (!matchesId && !matchesName && !matchesCat && !matchesNotes) {
          return false;
        }
      }

      // Category filter
      if (filterState.category && filterState.category !== 'all') {
        if (p.CategoryID !== filterState.category) return false;
      }

      // Status filter
      if (filterState.status && filterState.status !== 'all') {
        if (p.Status !== filterState.status) return false;
      }

      // Stock level filter
      if (filterState.stockLevel !== 'all') {
        const minThresh = p.MinStock ?? 10;
        if (filterState.stockLevel === 'healthy' && p.Stock <= minThresh) return false;
        if (filterState.stockLevel === 'low' && (p.Stock === 0 || p.Stock > minThresh)) return false;
        if (filterState.stockLevel === 'out' && p.Stock > 0) return false;
      }

      return true;
    });
  }, [products, filterState]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let valA: any = a[sortField as keyof Product];
      let valB: any = b[sortField as keyof Product];

      if (sortField === 'Margin') {
        valA = a.SalePrice > 0 ? ((a.SalePrice - a.CostPrice) / a.SalePrice) : 0;
        valB = b.SalePrice > 0 ? ((b.SalePrice - b.CostPrice) / b.SalePrice) : 0;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
    });
  }, [filteredProducts, sortField, sortOrder]);

  // Pagination calculation
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedProducts.slice(start, start + rowsPerPage);
  }, [sortedProducts, currentPage, rowsPerPage]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedProducts.map(p => p.ProductID));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const hasActiveFilters = 
    filterState.search.trim() !== '' || 
    filterState.category !== 'all' || 
    filterState.status !== 'all' || 
    filterState.stockLevel !== 'all';

  return (
    <div className="space-y-4">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Product Inventory Catalog
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Showing <span className="font-mono tabular-nums font-semibold text-neutral-800">{filteredProducts.length}</span> of{' '}
            <span className="font-mono tabular-nums text-neutral-800">{products.length}</span> total products
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-2 bg-red-50 text-red-700 px-3 py-1 rounded-lg border border-red-200 text-xs font-medium">
              <span className="font-mono tabular-nums font-bold">{selectedIds.size}</span> selected
              <button
                onClick={() => onExportCsv(true, Array.from(selectedIds))}
                className="hover:underline flex items-center gap-1 font-semibold text-red-800 ml-1"
                title="Export selected items to CSV"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <span className="text-red-300">|</span>
              <button
                onClick={() => onOpenBulkDeleteModal(Array.from(selectedIds))}
                className="hover:underline flex items-center gap-1 font-semibold text-red-800"
                title="Delete selected items"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}

          <button
            onClick={() => onExportCsv(false)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
            title="Download full catalog CSV"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Strip */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ProductID, Name, Category..."
              value={filterState.search}
              onChange={(e) => {
                onUpdateFilter({ search: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-neutral-400"
            />
            {filterState.search && (
              <button
                onClick={() => onUpdateFilter({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterState.category}
              onChange={(e) => {
                onUpdateFilter({ category: e.target.value });
                setCurrentPage(1);
              }}
              aria-label="Filter by Category"
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Dropdown Filter */}
            <select
              value={filterState.status}
              onChange={(e) => {
                onUpdateFilter({ status: e.target.value });
                setCurrentPage(1);
              }}
              aria-label="Filter by Product Status"
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Discontinued">Discontinued</option>
            </select>

            {/* Stock Level Dropdown */}
            <select
              value={filterState.stockLevel}
              onChange={(e) => {
                onUpdateFilter({ stockLevel: e.target.value as any });
                setCurrentPage(1);
              }}
              aria-label="Filter by Stock Level"
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="healthy">Healthy Stock (&gt; Min)</option>
              <option value="low">Low Stock (≤ Min)</option>
              <option value="out">Depleted (0 units)</option>
            </select>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="px-2.5 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                title="Reset all search & filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Products Table */}
      <div className="bg-white border border-neutral-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[720px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-xs">
              <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-600 select-none shadow-2xs">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all products on page"
                    checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p.ProductID))}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th 
                  onClick={() => handleSort('ProductID')}
                  className="py-3 px-3 cursor-pointer hover:text-red-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ProductID</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('ProductName')}
                  className="py-3 px-3 cursor-pointer hover:text-red-600 transition-colors min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>ProductName</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('CategoryID')}
                  className="py-3 px-3 cursor-pointer hover:text-red-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>CategoryID</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('CostPrice')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-red-600 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CostPrice</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('SalePrice')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-red-600 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>SalePrice</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('Margin')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-red-600 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin %</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('Stock')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-red-600 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('Status')}
                  className="py-3 px-3 cursor-pointer hover:text-red-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 text-sm">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const isSelected = selectedIds.has(p.ProductID);
                  const profit = p.SalePrice - p.CostPrice;
                  const margin = p.SalePrice > 0 ? (profit / p.SalePrice) * 100 : 0;

                  return (
                    <tr
                      key={p.ProductID}
                      onClick={() => onViewProduct(p)}
                      className={`hover:bg-neutral-50/70 transition-colors cursor-pointer ${
                        isSelected ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td 
                        className="py-3 px-3 text-center"
                        onClick={(e) => handleToggleSelect(p.ProductID, e)}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Select product ${p.ProductID}`}
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-neutral-300 text-red-600 focus:ring-red-500"
                        />
                      </td>

                      {/* ProductID */}
                      <td className="py-3 px-3 font-mono text-xs font-semibold text-neutral-800">
                        <div className="flex items-center gap-1.5">
                          <span>{p.ProductID}</span>
                          <button
                            onClick={(e) => handleCopyId(p.ProductID, e)}
                            className="text-neutral-400 hover:text-neutral-700 transition-colors"
                            title="Copy ProductID"
                          >
                            {copiedId === p.ProductID ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* ProductName */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900 hover:text-red-600 transition-colors">
                          {p.ProductName}
                        </div>
                        {p.Notes && (
                          <div className="text-xs text-neutral-400 truncate max-w-xs">
                            {p.Notes}
                          </div>
                        )}
                      </td>

                      {/* CategoryID */}
                      <td className="py-3 px-3 text-xs text-neutral-600">
                        <span className="font-medium">{p.CategoryID}</span>
                      </td>

                      {/* CostPrice */}
                      <td className="py-3 px-3 text-right font-mono text-xs text-neutral-600 tabular-nums">
                        ${p.CostPrice.toFixed(2)}
                      </td>

                      {/* SalePrice */}
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-neutral-900 tabular-nums">
                        ${p.SalePrice.toFixed(2)}
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-3 text-right font-mono text-xs tabular-nums">
                        <span
                          className={`font-semibold ${
                            margin >= 45
                              ? 'text-emerald-700'
                              : margin >= 20
                              ? 'text-neutral-800'
                              : 'text-amber-700'
                          }`}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      </td>

                      {/* Stock with inline quick buttons */}
                      <td 
                        className="py-3 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums">
                          <button
                            onClick={() => onUpdateStock(p.ProductID, Math.max(0, p.Stock - 1))}
                            className="w-5 h-5 rounded border border-neutral-200 text-neutral-600 hover:border-red-400 hover:text-red-600 flex items-center justify-center font-sans text-xs transition-colors"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <span
                            className={`min-w-[28px] font-bold ${
                              p.Stock === 0
                                ? 'text-red-600'
                                : p.Stock <= (p.MinStock ?? 10)
                                ? 'text-amber-800'
                                : 'text-neutral-900'
                            }`}
                          >
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

                      {/* Status */}
                      <td className="py-3 px-3 text-xs">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium ${
                            p.Status === 'In Stock'
                              ? 'bg-emerald-50 text-emerald-800'
                              : p.Status === 'Low Stock'
                              ? 'bg-amber-50 text-amber-900'
                              : p.Status === 'Out of Stock'
                              ? 'bg-red-50 text-red-700 font-semibold'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {p.Status}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td 
                        className="py-3 px-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewProduct(p)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                            title="View Product Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(p)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(p)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                        <Package className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-neutral-900">
                        No products match your criteria
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Try resetting filters or adding a new product to your inventory.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        {hasActiveFilters && (
                          <button
                            onClick={onResetFilters}
                            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            Clear Filters
                          </button>
                        )}
                        <button
                          onClick={onOpenAddModal}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Add Product
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer Strip */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page"
              className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs font-mono text-neutral-700 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="font-mono tabular-nums">
              Showing {Math.min(totalItems, (currentPage - 1) * rowsPerPage + 1)} - {Math.min(totalItems, currentPage * rowsPerPage)} of {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded bg-white border border-neutral-200 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Prev
            </button>
            <span className="px-2 font-medium text-neutral-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded bg-white border border-neutral-200 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
