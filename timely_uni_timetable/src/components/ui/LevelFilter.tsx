import type { Level } from '../../lib/types';

const LEVELS: Level[] = ['L100', 'L200', 'L300', 'L400', 'L500'];

interface LevelFilterProps {
  value: Level | null;
  onChange: (level: Level | null) => void;
}

const LevelFilter = ({ value, onChange }: LevelFilterProps) => (
  <div className="flex items-center gap-2 flex-wrap">
    {LEVELS.map(lvl => (
      <button
        key={lvl}
        onClick={() => onChange(value === lvl ? null : lvl)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
          value === lvl
            ? 'bg-[var(--gray-dark)] text-white border-[var(--gray-dark)]'
            : 'bg-white text-[var(--gray-600)] border-[var(--gray-200)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-50)]'
        }`}
      >
        {lvl}
      </button>
    ))}
  </div>
);

export default LevelFilter;
