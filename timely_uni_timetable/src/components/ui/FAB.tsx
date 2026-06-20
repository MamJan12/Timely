import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  title?: string;
}

const FAB = ({ onClick, title = 'Add' }: FABProps) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={title}
    className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--gray-dark)] text-white shadow-xl hover:bg-gray-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30"
  >
    <Plus className="w-6 h-6" />
  </button>
);

export default FAB;
