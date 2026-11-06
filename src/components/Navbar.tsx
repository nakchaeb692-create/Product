import React from 'react';
import { Package, Plus, FileSpreadsheet, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'products' | 'stock' | 'charts';
  onSelectTab: (tab: 'dashboard' | 'products' | 'stock' | 'charts') => void;
  onOpenAddModal: () => void;
  onOpenSheetsModal: () => void;
  isConnected: boolean;
  isSyncing: boolean;
  onQuickSync: () => void;
  totalProductsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenSheetsModal,
  isConnected,
  isSyncing,
  onQuickSync,
  totalProductsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs group-hover:bg-red-700 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-neutral-900 group-hover:text-red-600 transition-colors whitespace-nowrap">
                  StockPulse
                </span>
                <span className="text-[11px] font-medium text-neutral-500 whitespace-nowrap">
                  Sheets Inventory OS
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4 Single-line Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectTab('products')}
              className={`px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentTab === 'products'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <span>Product List</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-mono tabular-nums font-semibold">
                {totalProductsCount}
              </span>
            </button>
            <button
              onClick={() => onSelectTab('stock')}
              className={`px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                currentTab === 'stock'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Stock Summary
            </button>
            <button
              onClick={() => onSelectTab('charts')}
              className={`px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                currentTab === 'charts'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Analytics & Charts
            </button>
          </nav>

          {/* Zone 3: Primary Action & Google Sheets Connection */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Google Sheets Status & Quick Sync */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSheetsModal}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-2 transition-colors whitespace-nowrap ${
                  isConnected
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                title="Configure Google Sheets & Apps Script connection"
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-600' : 'text-neutral-500'}`} />
                <span className="hidden sm:inline">
                  {isConnected ? 'Sheets Live' : 'Connect Sheets'}
                </span>
                {isConnected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </button>

              {isConnected && (
                <button
                  onClick={onQuickSync}
                  disabled={isSyncing}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors disabled:opacity-50"
                  title="Quick sync with Google Sheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
                </button>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between border-t border-neutral-100 py-2 overflow-x-auto gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'dashboard' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('products')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'products' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            <span>Products</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-200 text-neutral-800 font-mono">
              {totalProductsCount}
            </span>
          </button>
          <button
            onClick={() => onSelectTab('stock')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'stock' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            Stock Summary
          </button>
          <button
            onClick={() => onSelectTab('charts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'charts' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            Charts
          </button>
        </div>
      </div>
    </header>
  );
};
