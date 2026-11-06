import React, { useState, useEffect } from 'react';
import { 
  Package, 
  LayoutDashboard, 
  Layers, 
  BarChart3, 
  Tag, 
  Plus, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'products' | 'categories' | 'stock' | 'charts';
  onSelectTab: (tab: 'dashboard' | 'products' | 'categories' | 'stock' | 'charts') => void;
  onOpenAddModal: () => void;
  onOpenSheetsModal: () => void;
  isConnected: boolean;
  isSyncing: boolean;
  onQuickSync: () => void;
  totalProductsCount: number;
  totalCategoriesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenSheetsModal,
  isConnected,
  isSyncing,
  onQuickSync,
  totalProductsCount,
  totalCategoriesCount,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products' as const,
      label: 'Product List',
      icon: Package,
      badge: totalProductsCount,
    },
    {
      id: 'categories' as const,
      label: 'Categories',
      icon: Tag,
      badge: totalCategoriesCount,
    },
    {
      id: 'stock' as const,
      label: 'Stock Summary',
      icon: Layers,
      badge: null,
    },
    {
      id: 'charts' as const,
      label: 'Analytics & Charts',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleNavClick = (tab: 'dashboard' | 'products' | 'categories' | 'stock' | 'charts') => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 text-white">
      {/* Top Brand & Actions */}
      <div className="space-y-6">
        {/* Wordmark Logo */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                StockPulse
              </span>
              <span className="text-[11px] font-medium text-red-100 whitespace-nowrap">
                Google Sheets OS
              </span>
            </div>
          </button>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-red-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button: Add Product */}
        <div className="px-1">
          <button
            onClick={() => {
              onOpenAddModal();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-4 bg-white text-red-600 hover:bg-neutral-100 active:bg-neutral-200 font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Plus className="w-4 h-4 text-red-600 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-red-200">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-red-600 font-bold shadow-xs'
                      : 'text-red-50 hover:bg-red-700/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-red-200'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono tabular-nums font-semibold ${
                        isActive
                          ? 'bg-red-100 text-red-700'
                          : 'bg-red-700/90 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Google Sheets Status Widget */}
      <div className="pt-4 border-t border-red-500/40 space-y-3">
        <div className="p-3 bg-red-700/80 border border-red-500/50 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-white">
              <FileSpreadsheet className="w-4 h-4 text-red-200" />
              <span>Google Sheets</span>
            </div>
            {isConnected ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-red-200 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-red-200" />
                <span>Offline</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-red-100 leading-tight">
            {isConnected
              ? 'Real-time sync active via Google Apps Script.'
              : 'Standalone mode. Connect a Google Sheet for cloud sync.'}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                onOpenSheetsModal();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-1.5 px-2 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-[11px] font-semibold rounded-lg transition-colors text-center"
            >
              {isConnected ? 'Settings' : 'Connect'}
            </button>
            {isConnected && (
              <button
                onClick={onQuickSync}
                disabled={isSyncing}
                className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors disabled:opacity-50"
                title="Sync now with Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        <div className="px-2 text-[10px] text-red-200 flex items-center justify-between">
          <span>v1.0 &middot; StockPulse</span>
          <button
            onClick={() => {
              onOpenSheetsModal();
              setIsMobileMenuOpen(false);
            }}
            className="hover:text-white underline"
          >
            Code.gs API
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-red-600 text-white border-b border-red-700 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1 text-white hover:bg-red-700 rounded-lg transition-colors focus:outline-none"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white text-red-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">StockPulse</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSheetsModal}
            className={`px-2 py-1 text-xs rounded-lg border font-medium flex items-center gap-1.5 ${
              isConnected
                ? 'bg-red-700/80 border-red-500 text-white'
                : 'bg-white text-red-600 border-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isConnected ? 'Live' : 'Connect'}</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="p-1.5 bg-white text-red-600 hover:bg-neutral-100 rounded-lg shadow-xs"
            title="Add product"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Slide-out Sidebar Drawer */}
          <aside className="relative w-72 max-w-[80vw] bg-red-600 text-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col md:fixed md:inset-y-0 z-30 bg-red-600 text-white shadow-md border-r border-red-700/80">
        {sidebarContent}
      </aside>
    </>
  );
};
