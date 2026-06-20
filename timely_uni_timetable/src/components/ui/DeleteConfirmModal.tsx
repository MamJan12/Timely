import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = ({ isOpen, itemName, description, onConfirm, onCancel }: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[var(--gray-dark)]">Delete this item?</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-6">
          <p className="text-sm text-[var(--gray-500)] mb-6">
            {description ?? (
              <>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-[var(--gray-dark)]">{itemName}</span>?
                {' '}This action cannot be undone.
              </>
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-full border border-[var(--gray-200)] text-sm font-medium text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition-colors"
            >
              No, keep it
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
