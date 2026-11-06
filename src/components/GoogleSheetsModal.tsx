import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Upload, 
  ExternalLink,
  Code2,
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/defaultProducts';
import { sheetsService } from '../services/sheetsService';
import { Product } from '../types/product';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  onSaveUrl: (url: string) => void;
  isConnected: boolean;
  onSetConnected: (connected: boolean) => void;
  autoSync: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  lastSyncTime: string | null;
  onPullFromSheet: () => Promise<void>;
  onPushToSheet: () => Promise<void>;
  isSyncing: boolean;
  products: Product[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  webAppUrl,
  onSaveUrl,
  isConnected,
  onSetConnected,
  autoSync,
  onToggleAutoSync,
  lastSyncTime,
  onPullFromSheet,
  onPushToSheet,
  isSyncing,
  products,
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'guide' | 'code'>('connect');
  const [inputUrl, setInputUrl] = useState(webAppUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter your Google Apps Script Web App URL first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await sheetsService.testConnection(inputUrl);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      onSaveUrl(inputUrl.trim());
      onSetConnected(true);
    }
  };

  const handleSaveAndConnect = async () => {
    onSaveUrl(inputUrl.trim());
    await handleTestConnection();
  };

  const handleDisconnect = () => {
    onSetConnected(false);
    onSaveUrl('');
    setInputUrl('');
    setTestResult(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleDownloadTemplate = () => {
    sheetsService.exportToCsv(products, 'stockpulse_google_sheet_template.csv');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-3xl w-full overflow-hidden transition-all my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <span>Google Sheets & Apps Script Backend</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {isConnected ? 'Connected Live' : 'Local / Standalone Mode'}
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Use Google Sheets as your cloud database with Google Apps Script as the REST API backend.
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

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-200 px-6 bg-neutral-50/50">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Connection & Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>5-Minute Setup Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code.gs Script</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: CONNECT & SYNC */}
          {activeTab === 'connect' && (
            <div className="space-y-5">
              {/* URL Input Box */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-800">
                  Google Apps Script Web App URL:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || !inputUrl.trim()}
                      className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isTesting ? (
                        <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-neutral-800 rounded-full animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                      <span>Test URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndConnect}
                      disabled={isTesting || !inputUrl.trim()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
                    >
                      Connect
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Deploy your Google Apps Script as a Web App with access set to &ldquo;Anyone&rdquo;. Need the script? Check the &ldquo;Code.gs Script&rdquo; tab.
                </p>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold">{testResult.message}</span>
                    {testResult.success && (
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Your app is now linked directly to Google Sheets for database reads, writes, and real-time syncing.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Sync Actions Grid */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Synchronization Operations
                  </span>
                  {lastSyncTime && (
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pull from Google Sheet */}
                  <div className="p-3 bg-white border border-neutral-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-neutral-600" />
                      <span className="text-xs font-semibold text-neutral-900">
                        Pull from Google Sheet
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Fetches all product records from your connected Google Sheet and updates your current view.
                    </p>
                    <button
                      onClick={onPullFromSheet}
                      disabled={!isConnected || isSyncing}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 rounded transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Pull Data Now</span>
                    </button>
                  </div>

                  {/* Push to Google Sheet */}
                  <div className="p-3 bg-white border border-neutral-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-semibold text-neutral-900">
                        Push All to Google Sheet
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Uploads all {products.length} current products into your Google Sheet (initializes headers automatically).
                    </p>
                    <button
                      onClick={onPushToSheet}
                      disabled={!isConnected || isSyncing}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Push All Products</span>
                    </button>
                  </div>
                </div>

                {/* Auto Sync Toggle */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900">Automatic Sync on Changes</span>
                    <p className="text-[11px] text-neutral-500">
                      Instantly save Add, Edit, Delete, and Stock changes directly to your Google Sheet.
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleAutoSync(!autoSync)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoSync ? 'bg-red-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        autoSync ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Disconnect Option */}
              {isConnected && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleDisconnect}
                    className="text-xs text-neutral-500 hover:text-red-600 underline"
                  >
                    Disconnect from Google Sheet (Switch to Offline Mode)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-center justify-between">
                <span>Deploying takes less than 3 minutes using Google Apps Script!</span>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-2.5 py-1 bg-white text-red-700 font-semibold rounded border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Sheet Template CSV</span>
                </button>
              </div>

              <ol className="space-y-3.5 text-neutral-700">
                <li className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="space-y-1">
                    <span className="font-bold text-neutral-900">Create a New Google Sheet</span>
                    <p className="text-neutral-500">
                      Open <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-red-600 font-semibold underline inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> to create a fresh Google Spreadsheet. Title it &ldquo;StockPulse Products&rdquo;.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="space-y-1">
                    <span className="font-bold text-neutral-900">Open Google Apps Script</span>
                    <p className="text-neutral-500">
                      In the Google Sheets top menu, click <strong className="text-neutral-800">Extensions</strong> &rarr; <strong className="text-neutral-800">Apps Script</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="space-y-1">
                    <span className="font-bold text-neutral-900">Paste Code.gs</span>
                    <p className="text-neutral-500">
                      Delete any existing code in the editor, switch to the <strong className="text-neutral-800">&ldquo;Code.gs Script&rdquo;</strong> tab above, click <strong className="text-neutral-800">&ldquo;Copy Code&rdquo;</strong>, and paste it into Apps Script.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div className="space-y-1">
                    <span className="font-bold text-neutral-900">Deploy as Web App</span>
                    <p className="text-neutral-500">
                      Click the blue <strong className="text-neutral-800">&ldquo;Deploy&rdquo;</strong> button at the top right &rarr; select <strong className="text-neutral-800">&ldquo;New deployment&rdquo;</strong>.
                    </p>
                    <div className="mt-1.5 p-2 bg-white rounded border border-neutral-200 text-[11px] font-mono space-y-0.5">
                      <div>&bull; Select type: <strong>Web app</strong></div>
                      <div>&bull; Description: <strong>StockPulse Backend</strong></div>
                      <div>&bull; Execute as: <strong>Me (your email)</strong></div>
                      <div>&bull; Who has access: <strong>Anyone</strong></div>
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    5
                  </span>
                  <div className="space-y-1">
                    <span className="font-bold text-neutral-900">Copy URL and Connect</span>
                    <p className="text-neutral-500">
                      Copy the generated Web App URL (ending with <code className="text-red-600 font-bold">/exec</code>), return here to the &ldquo;Connection & Sync&rdquo; tab, paste it, and click <strong className="text-neutral-800">&ldquo;Connect&rdquo;</strong>!
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* TAB 3: CODE.GS */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">
                    Google Apps Script (`Code.gs`)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Full REST API with `doGet` and `doPost` handlers for products, validation, and auto-formatting.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{codeCopied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 bg-neutral-950 text-neutral-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96 border border-neutral-800 leading-relaxed selection:bg-red-600">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>StockPulse Google Sheets Engine v1.0</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-neutral-700 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
