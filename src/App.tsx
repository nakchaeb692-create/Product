import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductListView } from './components/ProductListView';
import { CategoryListView } from './components/CategoryListView';
import { StockSummaryView } from './components/StockSummaryView';
import { ChartsView } from './components/ChartsView';
import { ProductModal } from './components/ProductModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CategoryModal } from './components/CategoryModal';
import { CategoryDeleteModal } from './components/CategoryDeleteModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, DEFAULT_CATEGORIES } from './data/defaultProducts';
import { sheetsService } from './services/sheetsService';
import { 
  Product, 
  Category,
  InventoryMetrics, 
  CategorySummary, 
  FilterState, 
  ProductStatus 
} from './types/product';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'products' | 'categories' | 'stock' | 'charts'>('dashboard');

  // Main Products Data State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = sheetsService.loadLocalProducts();
    return saved && saved.length > 0 ? saved : INITIAL_PRODUCTS;
  });

  // Main Categories Data State
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = sheetsService.loadLocalCategories();
    return saved && saved.length > 0 ? saved : INITIAL_CATEGORIES;
  });

  // Google Sheets Backend Config State
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return sheetsService.loadConfig().webAppUrl || '';
  });
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return !!sheetsService.loadConfig().webAppUrl;
  });
  const [autoSync, setAutoSync] = useState<boolean>(() => {
    return sheetsService.loadConfig().autoSync;
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    category: 'all',
    status: 'all',
    stockLevel: 'all',
  });

  // Modal Visibility States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // Category Modal Visibility States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persist products to localStorage
  useEffect(() => {
    sheetsService.saveLocalProducts(products);
  }, [products]);

  // Persist categories to localStorage
  useEffect(() => {
    sheetsService.saveLocalCategories(categories);
  }, [categories]);

  // Persist Sheets config
  useEffect(() => {
    sheetsService.saveConfig({ webAppUrl, autoSync });
  }, [webAppUrl, autoSync]);

  // Extract all categories dynamically from both registered categories and products
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => set.add(c.CategoryName));
    products.forEach((p) => {
      if (p.CategoryID) set.add(p.CategoryID);
    });
    return Array.from(set).sort();
  }, [categories, products]);

  // Existing Category IDs
  const existingCategoryIds = useMemo(() => {
    return categories.map((c) => c.CategoryID);
  }, [categories]);

  // Existing Product IDs
  const existingProductIds = useMemo(() => {
    return products.map((p) => p.ProductID);
  }, [products]);

  // Calculate high-precision inventory metrics
  const metrics = useMemo<InventoryMetrics>(() => {
    let totalProducts = products.length;
    let totalStockUnits = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyStockCount = 0;

    products.forEach((p) => {
      const stock = p.Stock || 0;
      const minStock = p.MinStock ?? 10;
      totalStockUnits += stock;
      totalCostValue += p.CostPrice * stock;
      totalRetailValue += p.SalePrice * stock;

      if (p.Status === 'Out of Stock' || stock === 0) {
        outOfStockCount++;
      } else if (p.Status === 'Low Stock' || stock <= minStock) {
        lowStockCount++;
      } else {
        healthyStockCount++;
      }
    });

    const potentialProfit = Math.max(0, totalRetailValue - totalCostValue);
    const overallMargin = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

    return {
      totalProducts,
      totalStockUnits,
      totalCostValue,
      totalRetailValue,
      potentialProfit,
      overallMargin,
      lowStockCount,
      outOfStockCount,
      healthyStockCount,
    };
  }, [products]);

  // Category Summaries
  const categorySummaries = useMemo<CategorySummary[]>(() => {
    const map = new Map<string, {
      count: number;
      totalStock: number;
      totalCostValue: number;
      totalRetailValue: number;
    }>();

    products.forEach((p) => {
      const cat = p.CategoryID || 'Uncategorized';
      const existing = map.get(cat) || { count: 0, totalStock: 0, totalCostValue: 0, totalRetailValue: 0 };
      existing.count++;
      existing.totalStock += p.Stock;
      existing.totalCostValue += p.CostPrice * p.Stock;
      existing.totalRetailValue += p.SalePrice * p.Stock;
      map.set(cat, existing);
    });

    const list: CategorySummary[] = [];
    map.forEach((val, key) => {
      const potentialProfit = Math.max(0, val.totalRetailValue - val.totalCostValue);
      const averageMargin = val.totalRetailValue > 0 ? (potentialProfit / val.totalRetailValue) * 100 : 0;
      list.push({
        category: key,
        count: val.count,
        totalStock: val.totalStock,
        totalCostValue: val.totalCostValue,
        totalRetailValue: val.totalRetailValue,
        potentialProfit,
        averageMargin,
      });
    });

    return list.sort((a, b) => b.totalRetailValue - a.totalRetailValue);
  }, [products]);

  // CRUD Actions
  const handleSaveProduct = async (product: Product) => {
    const isEdit = products.some((p) => p.ProductID === product.ProductID);

    if (isEdit) {
      setProducts((prev) =>
        prev.map((p) => (p.ProductID === product.ProductID ? product : p))
      );
      showToast(`Updated product #${product.ProductID}`, 'success');

      // Auto-sync to Google Sheet if connected
      if (isConnected && autoSync && webAppUrl) {
        sheetsService.updateProduct(webAppUrl, product).catch((e) => {
          console.error('Auto-sync update failed', e);
        });
      }
    } else {
      setProducts((prev) => [product, ...prev]);
      showToast(`Created new product #${product.ProductID}`, 'success');

      // Auto-sync to Google Sheet if connected
      if (isConnected && autoSync && webAppUrl) {
        sheetsService.addProduct(webAppUrl, product).catch((e) => {
          console.error('Auto-sync add failed', e);
        });
      }
    }

    // Keep productToView in sync if open
    if (productToView && productToView.ProductID === product.ProductID) {
      setProductToView(product);
    }
  };

  const handleDeleteSingle = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.ProductID !== productId));
    if (productToView?.ProductID === productId) {
      setProductToView(null);
    }
    showToast(`Deleted product #${productId}`, 'info');

    if (isConnected && autoSync && webAppUrl) {
      sheetsService.deleteProduct(webAppUrl, productId).catch((e) => {
        console.error('Auto-sync delete failed', e);
      });
    }
  };

  const handleDeleteBulk = async (productIds: string[]) => {
    const set = new Set(productIds);
    setProducts((prev) => prev.filter((p) => !set.has(p.ProductID)));
    showToast(`Deleted ${productIds.length} products`, 'info');

    if (isConnected && autoSync && webAppUrl) {
      // Refresh sheet with updated set
      const remaining = products.filter((p) => !set.has(p.ProductID));
      sheetsService.batchSync(webAppUrl, remaining).catch((e) => {
        console.error('Auto-sync bulk delete failed', e);
      });
    }
  };

  // Category CRUD Handlers
  const handleSaveCategory = async (cat: Category) => {
    const isEdit = categories.some((c) => c.CategoryID === cat.CategoryID);

    if (isEdit) {
      const oldCat = categories.find((c) => c.CategoryID === cat.CategoryID);
      setCategories((prev) => prev.map((c) => (c.CategoryID === cat.CategoryID ? cat : c)));

      // If category name changed, cascade update existing products
      if (oldCat && oldCat.CategoryName !== cat.CategoryName) {
        setProducts((prev) =>
          prev.map((p) => (p.CategoryID === oldCat.CategoryName ? { ...p, CategoryID: cat.CategoryName } : p))
        );
      }

      showToast(`Updated category "${cat.CategoryName}"`, 'success');

      if (isConnected && autoSync && webAppUrl) {
        sheetsService.updateCategory(webAppUrl, cat).catch((e) => {
          console.error('Auto-sync category update failed', e);
        });
      }
    } else {
      setCategories((prev) => [cat, ...prev]);
      showToast(`Created category "${cat.CategoryName}"`, 'success');

      if (isConnected && autoSync && webAppUrl) {
        sheetsService.addCategory(webAppUrl, cat).catch((e) => {
          console.error('Auto-sync category add failed', e);
        });
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const cat = categories.find((c) => c.CategoryID === categoryId);
    if (!cat) return;

    setCategories((prev) => prev.filter((c) => c.CategoryID !== categoryId));

    // Reassign products to General
    setProducts((prev) =>
      prev.map((p) =>
        p.CategoryID === cat.CategoryName || p.CategoryID === cat.CategoryID
          ? { ...p, CategoryID: 'General' }
          : p
      )
    );

    showToast(`Deleted category "${cat.CategoryName}"`, 'info');

    if (isConnected && autoSync && webAppUrl) {
      sheetsService.deleteCategory(webAppUrl, categoryId).catch((e) => {
        console.error('Auto-sync category delete failed', e);
      });
    }
  };

  const handleExportCategoriesCsv = () => {
    sheetsService.exportCategoriesToCsv(categories);
    showToast(`Exported ${categories.length} categories to CSV.`, 'success');
  };

  const handleNavigateToCategoryProducts = (categoryName: string) => {
    setFilterState((prev) => ({
      ...prev,
      category: categoryName,
      search: '',
    }));
    setCurrentTab('products');
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.ProductID === productId) {
          const minStock = p.MinStock ?? 10;
          let newStatus: ProductStatus = p.Status;
          if (newStock === 0) {
            newStatus = 'Out of Stock';
          } else if (newStock <= minStock) {
            newStatus = 'Low Stock';
          } else if (p.Status === 'Out of Stock' || p.Status === 'Low Stock') {
            newStatus = 'In Stock';
          }
          const updated: Product = {
            ...p,
            Stock: Math.max(0, newStock),
            Status: newStatus,
            LastUpdated: new Date().toISOString(),
          };

          if (isConnected && autoSync && webAppUrl) {
            sheetsService.updateProduct(webAppUrl, updated).catch((e) => {
              console.error('Auto-sync stock update failed', e);
            });
          }

          return updated;
        }
        return p;
      })
    );

    // Sync product in detail modal
    if (productToView && productToView.ProductID === productId) {
      const minStock = productToView.MinStock ?? 10;
      let newStatus: ProductStatus = productToView.Status;
      if (newStock === 0) newStatus = 'Out of Stock';
      else if (newStock <= minStock) newStatus = 'Low Stock';
      else if (productToView.Status === 'Out of Stock' || productToView.Status === 'Low Stock') newStatus = 'In Stock';

      setProductToView({
        ...productToView,
        Stock: Math.max(0, newStock),
        Status: newStatus,
        LastUpdated: new Date().toISOString(),
      });
    }
  };

  // Google Sheets Sync Operations
  const handlePullFromSheet = async () => {
    if (!webAppUrl.trim()) {
      showToast('No Google Apps Script URL configured.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await sheetsService.fetchProducts(webAppUrl);
      if (res.success) {
        if (res.products.length > 0) {
          setProducts(res.products);
        }
        setLastSyncTime(new Date().toISOString());
        
        // Also pull categories if present
        try {
          const resCats = await sheetsService.fetchCategories(webAppUrl);
          if (resCats.success && resCats.categories.length > 0) {
            setCategories(resCats.categories);
          }
        } catch {
          // Categories tab may be empty or not yet deployed
        }

        showToast(`Synchronized catalog with Google Sheets.`, 'success');
      } else {
        showToast(res.message || 'Failed to pull data from Google Sheets.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushToSheet = async () => {
    if (!webAppUrl.trim()) {
      showToast('No Google Apps Script URL configured.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await sheetsService.batchSync(webAppUrl, products);
      if (res.success) {
        // Also push categories
        try {
          await sheetsService.batchSyncCategories(webAppUrl, categories);
        } catch {
          // Non-critical if Categories sheet not ready
        }
        setLastSyncTime(new Date().toISOString());
        showToast(`Pushed all ${products.length} products & ${categories.length} categories to Google Sheet.`, 'success');
      } else {
        showToast(res.message || 'Failed to push to Google Sheet.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQuickSync = async () => {
    await handlePullFromSheet();
  };

  // Export CSV
  const handleExportCsv = (selectedOnly = false, selectedIds?: string[]) => {
    let itemsToExport = products;
    if (selectedOnly && selectedIds && selectedIds.length > 0) {
      const set = new Set(selectedIds);
      itemsToExport = products.filter((p) => set.has(p.ProductID));
    }
    sheetsService.exportToCsv(itemsToExport, `stockpulse_products_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast(`Exported ${itemsToExport.length} products to CSV.`, 'success');
  };

  // Navigation and Filter Helpers
  const handleNavigateToProducts = (filterStatus?: string) => {
    if (filterStatus) {
      setFilterState((prev) => ({ ...prev, status: filterStatus }));
    }
    setCurrentTab('products');
  };

  const handleUpdateFilter = (updates: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilterState({
      search: '',
      category: 'all',
      status: 'all',
      stockLevel: 'all',
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans">
      {/* Left Red Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => {
          setProductToEdit(null);
          setIsAddEditModalOpen(true);
        }}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        isConnected={isConnected}
        isSyncing={isSyncing}
        onQuickSync={handleQuickSync}
        totalProductsCount={products.length}
        totalCategoriesCount={categories.length}
      />

      {/* Main Viewport Column (Offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 lg:pl-72">
        {/* Desktop Top Header Bar with Contextual Breadcrumb & Quick Actions */}
        <header className="hidden md:flex h-16 bg-white border-b border-neutral-200 px-6 lg:px-8 items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-neutral-400">StockPulse</span>
            <span className="text-neutral-300">/</span>
            <span className="font-bold text-neutral-900">
              {currentTab === 'dashboard' && 'Inventory Dashboard'}
              {currentTab === 'products' && 'Product Catalog'}
              {currentTab === 'categories' && 'Category Management'}
              {currentTab === 'stock' && 'Stock & Reorder Summary'}
              {currentTab === 'charts' && 'Analytics & Performance Charts'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Google Sheets Live Status */}
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-2 transition-colors ${
                isConnected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
              <span>{isConnected ? 'Sheets Live' : 'Connect Google Sheets'}</span>
            </button>

            {/* Quick Export CSV */}
            <button
              onClick={() => handleExportCsv(false)}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Export CSV
            </button>

            {/* Quick Add Product */}
            <button
              onClick={() => {
                setProductToEdit(null);
                setIsAddEditModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>+ Add Product</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              products={products}
              metrics={metrics}
              categorySummaries={categorySummaries}
              onNavigateToProducts={handleNavigateToProducts}
              onNavigateToStock={() => setCurrentTab('stock')}
              onNavigateToCharts={() => setCurrentTab('charts')}
              onOpenAddModal={() => {
                setProductToEdit(null);
                setIsAddEditModalOpen(true);
              }}
              onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              onViewProduct={(p) => setProductToView(p)}
              onExportCsv={() => handleExportCsv(false)}
              onUpdateStock={handleUpdateStock}
              isConnected={isConnected}
            />
          )}

          {currentTab === 'products' && (
            <ProductListView
              products={products}
              categories={existingCategories}
              filterState={filterState}
              onUpdateFilter={handleUpdateFilter}
              onResetFilters={handleResetFilters}
              onOpenAddModal={() => {
                setProductToEdit(null);
                setIsAddEditModalOpen(true);
              }}
              onOpenEditModal={(p) => {
                setProductToEdit(p);
                setIsAddEditModalOpen(true);
              }}
              onOpenDeleteModal={(p) => setProductToDelete(p)}
              onOpenBulkDeleteModal={(ids) => setBulkDeleteIds(ids)}
              onViewProduct={(p) => setProductToView(p)}
              onUpdateStock={handleUpdateStock}
              onExportCsv={handleExportCsv}
            />
          )}

          {currentTab === 'categories' && (
            <CategoryListView
              categories={categories}
              products={products}
              onOpenAddModal={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              onOpenEditModal={(cat) => {
                setCategoryToEdit(cat);
                setIsCategoryModalOpen(true);
              }}
              onOpenDeleteModal={(cat) => setCategoryToDelete(cat)}
              onNavigateToCategoryProducts={handleNavigateToCategoryProducts}
              onExportCategoriesCsv={handleExportCategoriesCsv}
            />
          )}

          {currentTab === 'stock' && (
            <StockSummaryView
              products={products}
              metrics={metrics}
              categorySummaries={categorySummaries}
              onUpdateStock={handleUpdateStock}
              onViewProduct={(p) => setProductToView(p)}
              onExportCsv={handleExportCsv}
            />
          )}

          {currentTab === 'charts' && (
            <ChartsView
              products={products}
              metrics={metrics}
              categorySummaries={categorySummaries}
              onViewProduct={(p) => setProductToView(p)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-200 mt-auto py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-800">StockPulse</span>
              <span>&middot;</span>
              <span>Google Sheets &amp; Apps Script Backend</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="hover:text-red-600 transition-colors"
              >
                Backend Setup &amp; Code.gs
              </button>
              <button
                onClick={() => handleExportCsv(false)}
                className="hover:text-red-600 transition-colors"
              >
                Export Catalog CSV
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        existingCategories={existingCategories}
        existingProductIds={existingProductIds}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={productToView}
        isOpen={!!productToView}
        onClose={() => setProductToView(null)}
        onOpenEdit={(p) => {
          setProductToEdit(p);
          setIsAddEditModalOpen(true);
        }}
        onOpenDelete={(p) => setProductToDelete(p)}
        onUpdateStock={handleUpdateStock}
      />

      {/* Delete Confirmation Modal (Single & Bulk) */}
      <DeleteConfirmModal
        isOpen={!!productToDelete || !!bulkDeleteIds}
        onClose={() => {
          setProductToDelete(null);
          setBulkDeleteIds(null);
        }}
        productToDelete={productToDelete}
        bulkDeleteIds={bulkDeleteIds || undefined}
        onConfirmSingle={handleDeleteSingle}
        onConfirmBulk={handleDeleteBulk}
      />

      {/* Category Modal (Add & Edit) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
        existingCategoryIds={existingCategoryIds}
      />

      {/* Category Delete Modal */}
      <CategoryDeleteModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        categoryToDelete={categoryToDelete}
        linkedProductsCount={
          categoryToDelete
            ? products.filter(
                (p) =>
                  p.CategoryID === categoryToDelete.CategoryName ||
                  p.CategoryID === categoryToDelete.CategoryID
              ).length
            : 0
        }
        onConfirmDelete={handleDeleteCategory}
      />

      {/* Google Sheets Connection & Guide Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        webAppUrl={webAppUrl}
        onSaveUrl={(url) => setWebAppUrl(url)}
        isConnected={isConnected}
        onSetConnected={setIsConnected}
        autoSync={autoSync}
        onToggleAutoSync={setAutoSync}
        lastSyncTime={lastSyncTime}
        onPullFromSheet={handlePullFromSheet}
        onPushToSheet={handlePushToSheet}
        isSyncing={isSyncing}
        products={products}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs flex items-center justify-between gap-3 transition-all ${
              t.type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-800'
                : t.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-white text-neutral-900 border-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-white shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-neutral-400 hover:text-white p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
