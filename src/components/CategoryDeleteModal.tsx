import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Category } from '../types/product';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToDelete: Category | null;
  linkedProductsCount: number;
  onConfirmDelete: (categoryId: string) => Promise<void> | void;
}

export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  isOpen,
  onClose,
  categoryToDelete,
  linkedProductsCount,
  onConfirmDelete,
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

  if (!isOpen || !categoryToDelete) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(categoryToDelete.CategoryID);
      onClose();
    } catch (err) {
      console.error('Delete category error', err);
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
              Delete Category {categoryToDelete.CategoryID}?
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Are you sure you want to delete <strong className="text-neutral-800">&ldquo;{categoryToDelete.CategoryName}&rdquo;</strong>?
            </p>
          </div>

          {/* Linked products warning */}
          {linkedProductsCount > 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{linkedProductsCount} products currently assigned.</span>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Products in this category will be reassigned to &ldquo;General&rdquo; so they are not lost.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600">
              No products are currently assigned to this category. It is safe to remove.
            </div>
          )}

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
