import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  Copy, 
  Check, 
  Tag, 
  Package, 
  ArrowUpRight, 
  RotateCcw 
} from 'lucide-react';
import { Category, Product } from '../types/product';

interface CategoryListViewProps {
  categories: Category[];
  products: Product[];
  onOpenAddModal: () => void;
  onOpenEditModal: (category: Category) => void;
  onOpenDeleteModal: (category: Category) => void;
  onNavigateToCategoryProducts: (categoryName: string) => void;
  onExportCategoriesCsv: () => void;
}

export const CategoryListView: React.FC<CategoryListViewProps> = ({
  categories,
  products,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onNavigateToCategoryProducts,
  onExportCategoriesCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'CategoryID' | 'CategoryName' | 'ProductsCount' | 'TotalStock'>('CategoryID');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate product metrics per category
  const categoryStats = useMemo(() => {
    const stats = new Map<string, { count: number; totalStock: number; totalValue: number }>();

    products.forEach((p) => {
      const cat = p.CategoryID || 'General';
      const existing = stats.get(cat) || { count: 0, totalStock: 0, totalValue: 0 };
      existing.count += 1;
      existing.totalStock += p.Stock || 0;
      existing.totalValue += (p.SalePrice || 0) * (p.Stock || 0);
      stats.set(cat, existing);
    });

    return stats;
  }, [products]);

  // Copy Category ID
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Sort handler
  const handleSort = (field: 'CategoryID' | 'CategoryName' | 'ProductsCount' | 'TotalStock') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchId = c.CategoryID.toLowerCase().includes(q);
      const matchName = c.CategoryName.toLowerCase().includes(q);
      const matchNote = (c.Note || '').toLowerCase().includes(q);
      return matchId || matchName || matchNote;
    });
  }, [categories, searchQuery]);

  // Sorted categories
  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      const statA = categoryStats.get(a.CategoryName) || categoryStats.get(a.CategoryID) || { count: 0, totalStock: 0, totalValue: 0 };
      const statB = categoryStats.get(b.CategoryName) || categoryStats.get(b.CategoryID) || { count: 0, totalStock: 0, totalValue: 0 };

      if (sortField === 'ProductsCount') {
        return sortOrder === 'asc' ? statA.count - statB.count : statB.count - statA.count;
      }
      if (sortField === 'TotalStock') {
        return sortOrder === 'asc' ? statA.totalStock - statB.totalStock : statB.totalStock - statA.totalStock;
      }
      if (sortField === 'CategoryName') {
        return sortOrder === 'asc' 
          ? a.CategoryName.localeCompare(b.CategoryName) 
          : b.CategoryName.localeCompare(a.CategoryName);
      }
      return sortOrder === 'asc' 
        ? a.CategoryID.localeCompare(b.CategoryID) 
        : b.CategoryID.localeCompare(a.CategoryID);
    });
  }, [filteredCategories, sortField, sortOrder, categoryStats]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Category Management
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage product departments, classification IDs, and warehouse organizational notes.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCategoriesCsv}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
            title="Download categories CSV"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar Strip */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by CategoryID, CategoryName, or Note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                Clear
              </button>
            )}
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2.5 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Categories Table */}
      <div className="bg-white border border-neutral-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[720px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-xs">
              <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-600 select-none shadow-2xs">
                <th 
                  onClick={() => handleSort('CategoryID')}
                  className="py-3 px-4 cursor-pointer hover:text-red-600 transition-colors w-36"
                >
                  <div className="flex items-center gap-1">
                    <span>CategoryID</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('CategoryName')}
                  className="py-3 px-4 cursor-pointer hover:text-red-600 transition-colors min-w-[200px]"
                >
                  <div className="flex items-center gap-1">
                    <span>CategoryName</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[240px]">
                  <span>Note</span>
                </th>
                <th 
                  onClick={() => handleSort('ProductsCount')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-red-600 transition-colors w-32"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Products</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('TotalStock')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-red-600 transition-colors w-32"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total Units</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 text-sm">
              {sortedCategories.length > 0 ? (
                sortedCategories.map((cat) => {
                  const stats = categoryStats.get(cat.CategoryName) || categoryStats.get(cat.CategoryID) || { count: 0, totalStock: 0, totalValue: 0 };

                  return (
                    <tr
                      key={cat.CategoryID}
                      className="hover:bg-neutral-50/70 transition-colors group"
                    >
                      {/* CategoryID */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-neutral-800">
                        <div className="flex items-center gap-1.5">
                          <span>{cat.CategoryID}</span>
                          <button
                            onClick={(e) => handleCopyId(cat.CategoryID, e)}
                            className="text-neutral-400 hover:text-neutral-700 transition-colors"
                            title="Copy CategoryID"
                          >
                            {copiedId === cat.CategoryID ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* CategoryName */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                            {cat.CategoryName}
                          </span>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 text-xs text-neutral-500">
                        {cat.Note ? (
                          <span className="line-clamp-2">{cat.Note}</span>
                        ) : (
                          <span className="text-neutral-300 italic">No notes provided</span>
                        )}
                      </td>

                      {/* Linked Products Count */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onNavigateToCategoryProducts(cat.CategoryName)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-800 transition-colors tabular-nums"
                          title="View products in this category"
                        >
                          <span>{stats.count}</span>
                          <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-red-600" />
                        </button>
                      </td>

                      {/* Total Units */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-neutral-900 tabular-nums">
                        {stats.totalStock.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onNavigateToCategoryProducts(cat.CategoryName)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                            title="View Products"
                          >
                            <Package className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(cat)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded transition-colors"
                            title="Edit Category"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(cat)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Category"
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
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                        <Tag className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-neutral-900">
                        No categories found
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {searchQuery ? `No category matching "${searchQuery}".` : 'Create your first department category to organize products.'}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            Clear Search
                          </button>
                        )}
                        <button
                          onClick={onOpenAddModal}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Add Category
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono tabular-nums">
            Total {categories.length} categories registered
          </span>
          <button
            onClick={onExportCategoriesCsv}
            className="text-xs text-neutral-600 hover:text-red-600 underline font-medium"
          >
            Export Categories CSV
          </button>
        </div>
      </div>
    </div>
  );
};
