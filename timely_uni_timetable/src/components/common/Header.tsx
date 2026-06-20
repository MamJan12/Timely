import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, UserCircle } from 'lucide-react';
import ActionMenu from '../ui/ActionMenu';
import { AppContext } from '../../context/AppContext';
import { api } from '../../lib/api';

const PORTAL_LABELS: Record<string, string> = {
  ADMIN:    'Admin Portal',
  LECTURER: 'Lecturer Portal',
  STUDENT:  'Student Portal',
};

const Header = () => {
  const { user, role, onLogout } = useContext(AppContext);
  const navigate = useNavigate();

  const displayName = user?.admin
    ? `${user.admin.firstName} ${user.admin.lastName}`
    : user?.lecturer
      ? `${user.lecturer.firstName} ${user.lecturer.lastName}`
      : user?.student
        ? `${user.student.firstName} ${user.student.lastName}`
        : user?.email ?? 'User';

  const portalLabel = role ? (PORTAL_LABELS[role] ?? 'Portal') : 'Portal';

  const handleLogout = async () => {
    try {
      const raw = localStorage.getItem('timely_auth');
      if (raw) {
        const { refreshToken } = JSON.parse(raw);
        if (refreshToken) await api.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      onLogout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-[var(--primary-400)] px-6 py-3">
      <h6 className="text-sm font-medium text-[var(--primary-400)]">{portalLabel}</h6>
      <div className="flex items-center gap-2">
        <UserCircle className="w-8 h-8 text-[var(--gray-400)]" />
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <p className="text-sm text-[var(--gray-800)] leading-tight">{displayName}</p>
            <small className="text-[10px] text-[var(--primary-400)]">{role ?? ''}</small>
          </div>
          <ActionMenu
            trigger={<div className="border border-black rounded-sm"><ChevronDown className="w-4 h-4" /></div>}
            actions={[
              { label: 'Settings', onClick: () => navigate('/admin/settings') },
              { label: 'Logout',   onClick: handleLogout },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
