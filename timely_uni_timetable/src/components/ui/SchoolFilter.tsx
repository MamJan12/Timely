import type { School } from '../../lib/types';

interface SchoolFilterProps {
  schools: School[];
  value: string | null;
  onChange: (schoolId: string | null) => void;
}

const SchoolFilter = ({ schools, value, onChange }: SchoolFilterProps) => (
  <div className="flex items-center gap-2 flex-wrap">
    {schools.map(school => {
      const active = value === school.id;
      return (
        <button
          key={school.id}
          onClick={() => onChange(active ? null : school.id)}
          className={`px-4 py-2 rounded-xl text-center transition-colors border flex flex-col items-center min-w-[72px] ${
            active
              ? 'bg-[var(--gray-dark)] border-[var(--gray-dark)]'
              : 'bg-white border-[var(--gray-200)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-50)]'
          }`}
        >
          <span className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-[var(--gray-700)]'}`}>
            {school.abbreviation}
          </span>
          <span className={`text-[8px] leading-tight mt-0.5 max-w-[100px] ${active ? 'text-white/50' : 'text-[var(--gray-400)]'}`}>
            {school.name}
          </span>
        </button>
      );
    })}
  </div>
);

export default SchoolFilter;
