import type { Department } from '../../lib/types';

interface DepartmentFilterProps {
  departments: Department[];
  value: string | null;
  onChange: (departmentId: string | null) => void;
}

const DepartmentFilter = ({ departments, value, onChange }: DepartmentFilterProps) => (
  <div className="flex items-center gap-2 flex-wrap">
    {departments.map(dept => {
      const active = value === dept.id;
      return (
        <button
          key={dept.id}
          onClick={() => onChange(active ? null : dept.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            active
              ? 'bg-[var(--gray-dark)] text-white border-[var(--gray-dark)]'
              : 'bg-white text-[var(--gray-600)] border-[var(--gray-200)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-50)]'
          }`}
        >
          {dept.code}
        </button>
      );
    })}
  </div>
);

export default DepartmentFilter;
