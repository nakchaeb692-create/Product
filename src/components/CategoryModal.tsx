import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, FolderPlus, Tag } from 'lucide-react';
import { Category } from '../types/product';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => Promise<void> | void;
  categoryToEdit?: Category | null;
  existingCategoryIds: string[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryToEdit,
  existingCategoryIds,
}) => {
  const isEditing = !!categoryToEdit;

  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate unique next Category ID (CAT-101, CAT-102...)
  const generateNextId = () => {
    let nextNum = 101;
    while (existingCategoryIds.includes(`CAT-${nextNum}`)) {
      nextNum++;
    }
    setCategoryId(`CAT-${nextNum}`);
  };

  useEffect(() => {
    if (categoryToEdit) {
      setCategoryId(categoryToEdit.CategoryID);
      setCategoryName(categoryToEdit.CategoryName);
      setNote(categoryToEdit.Note || '');
      setError(null);
    } else {
      generateNextId();
      setCategoryName('');
      setNote('');
      setError(null);
    }
  }, [categoryToEdit, isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = categoryId.trim().toUpperCase();
    const cleanName = categoryName.trim();

    if (!cleanId) {
      setError('Category ID is required.');
      return;
    }

    if (!isEditing && existingCategoryIds.includes(cleanId)) {
      setError(`Category ID "${cleanId}" already exists. Please choose a unique ID.`);
      return;
    }

    if (!cleanName) {
      setError('Category Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Category = {
        CategoryID: cleanId,
        CategoryName: cleanName,
        Note: note.trim(),
        CreatedAt: categoryToEdit?.CreatedAt || new Date().toISOString(),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-lg w-full overflow-hidden transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isEditing ? `Modifying category #${categoryId}` : 'Create a new catalog classification department'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* CategoryID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-700">
                Category ID <span className="text-red-600">*</span>
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
              value={categoryId}
              disabled={isEditing}
              onChange={(e) => setCategoryId(e.target.value.toUpperCase())}
              placeholder="e.g. CAT-108"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-500"
              required
            />
          </div>

          {/* CategoryName */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Category Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Smart Wearables & Sensors"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Note / Description (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Department guidelines, vendor details, warehouse zone."
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
              <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
