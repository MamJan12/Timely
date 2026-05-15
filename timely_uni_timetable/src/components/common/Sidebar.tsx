import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    Users,
    UserCog,
    GraduationCap,
    MessageSquareWarning,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";


// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    {
        section: "Overview",
        links: [
            { label: "Dashboard",   path: "/admin/dashboard",   icon: LayoutDashboard },
            { label: "Schedule",    path: "/admin/schedule",    icon: CalendarDays },
        ],
    },
    {
        section: "Management",
        links: [
            { label: "Courses",     path: "/admin/courses",     icon: BookOpen },
            { label: "Lecturers",   path: "/admin/lecturers",   icon: GraduationCap },
            { label: "Students",    path: "/admin/students",    icon: Users },
            { label: "Admin Users", path: "/admin/admin-users", icon: UserCog },
        ],
    },
    {
        section: "Activity",
        links: [
            { label: "Feedback",    path: "/admin/feedback",    icon: MessageSquareWarning },
            { label: "Settings",    path: "/admin/settings",    icon: Settings },
        ],
    },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
    const location = useLocation();

    return (
        <aside
            className={`
                fixed top-0 left-0 h-screen z-50 flex flex-col
                bg-[var(--gray-dark)] text-white
                transition-all duration-300 ease-in-out
                ${collapsed ? "w-20" : "w-80"}
            `}
        >
            {/* ── Logo + collapse toggle ── */}
            <div className={`flex items-center border-b border-white/10 h-[73px] px-5 ${collapsed ? "justify-center" : "justify-between"}`}>
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary-200)] flex items-center justify-center shrink-0">
                            <CalendarDays className="w-4 h-4 text-[var(--gray-dark)]" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-sm font-bold tracking-wide text-white">TIMELY</p>
                            <p className="text-[10px] text-[var(--primary-200)] font-medium tracking-widest uppercase">Admin Portal</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-[var(--primary-200)] hover:text-[var(--gray-dark)] flex items-center justify-center transition-all duration-200 shrink-0"
                >
                    {collapsed
                        ? <ChevronRight className="w-3.5 h-3.5" />
                        : <ChevronLeft  className="w-3.5 h-3.5" />
                    }
                </button>
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-none">
                {NAV_ITEMS.map(({ section, links }) => (
                    <div key={section}>
                        {/* Section label — hidden when collapsed */}
                        {!collapsed && (
                            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-2">
                                {section}
                            </p>
                        )}

                        <ul className="space-y-1">
                            {links.map(({ label, path, icon: Icon }) => {
                                const isActive = location.pathname === path;
                                return (
                                    <li key={path}>
                                        <NavLink
                                            to={path}
                                            title={collapsed ? label : undefined}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                                transition-all duration-200 group relative
                                                ${isActive
                                                    ? "bg-[var(--primary-200)] text-[var(--gray-dark)]"
                                                    : "text-white/60 hover:text-white hover:bg-white/10"
                                                }
                                                ${collapsed ? "justify-center" : ""}
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[var(--gray-dark)]" : ""}`} />

                                            {!collapsed && <span>{label}</span>}

                                            {/* Active indicator bar */}
                                            {isActive && !collapsed && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gray-dark)]" />
                                            )}

                                            {/* Tooltip when collapsed */}
                                            {collapsed && (
                                                <span className="
                                                    absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
                                                    bg-[var(--gray-dark)] border border-white/10
                                                    text-white text-xs font-medium whitespace-nowrap
                                                    opacity-0 pointer-events-none
                                                    group-hover:opacity-100 transition-opacity duration-150
                                                    shadow-lg z-50
                                                ">
                                                    {label}
                                                </span>
                                            )}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* ── Footer ── */}
            <div className={`border-t border-white/10 px-4 py-4 ${collapsed ? "flex justify-center" : ""}`}>
                {collapsed ? (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-200)] flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--gray-dark)]">A</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary-200)] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[var(--gray-dark)]">A</span>
                        </div>
                        <div className="leading-tight overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">Admin</p>
                            <p className="text-[11px] text-white/40 truncate">admin@timely.com</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;