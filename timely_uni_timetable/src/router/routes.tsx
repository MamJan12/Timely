import { createBrowserRouter, redirect } from 'react-router-dom';
import ErrorPage              from '../pages/ErrorPage';
import LoginPage              from '../pages/auth/loginPage';
import AdminDashboard         from '../pages/adminDashboard';
import AdminComplaintPage     from '../pages/adminComplaintPage';
import SchedulePage           from '../pages/SchedulePage';
import GenTimetablePage       from '../pages/GenTimetablePage';
import AppLayout              from '../components/layouts/AppLayout';
import LecturerTimetablePage  from '../pages/lecturer/LecturerTimetablePage';
import LecturerComplaintsPage from '../pages/lecturer/LecturerComplaintsPage';
import StudentTimetablePage   from '../pages/student/StudentTimetablePage';
import StudentComplaintsPage  from '../pages/student/StudentComplaintsPage';
import LecturersPage          from '../pages/admin/LecturersPage';
import CoursesPage            from '../pages/admin/CoursesPage';
import DepartmentsPage        from '../pages/admin/DepartmentsPage';
import SettingsPage           from '../pages/admin/SettingsPage';
import { getUserRole }        from '../utils/authRedirect';
import type { Role }          from '../lib/types';

const roleLoader = () => {
  const role = getUserRole();
  if (role === 'ADMIN')    return redirect('/admin/dashboard');
  if (role === 'LECTURER') return redirect('/lecturer/timetable');
  if (role === 'STUDENT')  return redirect('/student/timetable');
  return redirect('/login');
};

const requireRole = (...allowed: Role[]) => () => {
  const role = getUserRole();
  if (!role) return redirect('/login');
  if (!allowed.includes(role)) return redirect('/login');
  return null;
};

const routes = createBrowserRouter([
  {
    path: '/',
    loader: roleLoader,
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: '/admin',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    loader: requireRole('ADMIN'),
    children: [
      { path: 'dashboard',    element: <AdminDashboard />    },
      { path: 'complaints',   element: <AdminComplaintPage /> },
      { path: 'schedule',     element: <SchedulePage />      },
      { path: 'schedule/:id', element: <GenTimetablePage />  },
      { path: 'lecturers',    element: <LecturersPage />     },
      { path: 'departments',  element: <DepartmentsPage />   },
      { path: 'courses',      element: <CoursesPage />       },
      { path: 'settings',     element: <SettingsPage />      },
    ],
  },

  // ── Lecturer ──────────────────────────────────────────────────────────────
  {
    path: '/lecturer',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    loader: requireRole('LECTURER'),
    children: [
      { path: 'timetable',  element: <LecturerTimetablePage />  },
      { path: 'complaints', element: <LecturerComplaintsPage /> },
    ],
  },

  // ── Student ───────────────────────────────────────────────────────────────
  {
    path: '/student',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    loader: requireRole('STUDENT'),
    children: [
      { path: 'timetable',  element: <StudentTimetablePage />  },
      { path: 'complaints', element: <StudentComplaintsPage /> },
    ],
  },

  { path: '*', element: <ErrorPage /> },
]);

export default routes;
