import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Product } from '../types/product';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToDelete?: Product | null;
  bulkDeleteIds?: string[];
  onConfirmSingle: (productId: string) => Promise<void> | void;
  onConfirmBulk: (productIds: string[]) => Promise<void> | void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  productToDelete,
  bulkDeleteIds,
  onConfirmSingle,
  onConfirmBulk,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const isBulk = bulkDeleteIds && bulkDeleteIds.length > 0;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      if (isBulk && bulkDeleteIds) {
        await onConfirmBulk(bulkDeleteIds);
      } else if (productToDelete) {
        await onConfirmSingle(productToDelete.ProductID);
      }
      onClose();
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-md w-full overflow-hidden transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1.5">
            <h3 className="text-base font-bold text-neutral-900">
              {isBulk
                ? `Delete ${bulkDeleteIds.length} Selected Products?`
                : `Delete Product ${productToDelete?.ProductID}?`}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {isBulk
                ? `This will permanently remove ${bulkDeleteIds.length} items from your inventory catalog and Google Sheet.`
                : `Are you sure you want to delete "${productToDelete?.ProductName}"? This action cannot be undone.`}
            </p>
          </div>

          {/* Warning box */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>If connected to Google Sheets, the corresponding row will be removed.</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="w-full px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
