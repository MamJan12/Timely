import { Pencil, Trash2 } from 'lucide-react';

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

const RowActions = ({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: RowActionsProps) => (
  <div className="flex items-center justify-center gap-2">
    <button
      type="button"
      onClick={onEdit}
      aria-label={editLabel}
      className="p-1.5 rounded-lg hover:bg-[var(--gray-100)] transition-colors"
    >
      <Pencil className="w-3.5 h-3.5 text-[var(--gray-500)]" />
    </button>
    <button
      type="button"
      onClick={onDelete}
      aria-label={deleteLabel}
      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5 text-red-500" />
    </button>
  </div>
);

export default RowActions;
