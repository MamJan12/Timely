import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback, useContext } from "react";
import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    GraduationCap,
    Building2,
    MessageSquareWarning,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";

// ── Nav config per role ───────────────────────────────────────────────────────

const NAV_CONFIG = {
    admin: {
        portalLabel: "Admin Portal",
        sections: [
            {
                section: "Overview",
                links: [
                    { label: "Dashboard",  path: "/admin/dashboard",  icon: LayoutDashboard     },
                    { label: "Schedule",   path: "/admin/schedule",   icon: CalendarDays        },
                ],
            },
            {
                section: "Management",
                links: [
                    { label: "Courses",      path: "/admin/courses",      icon: BookOpen      },
                    { label: "Lecturers",    path: "/admin/lecturers",    icon: GraduationCap },
                    { label: "Departments",  path: "/admin/departments",  icon: Building2     },
                ],
            },
            {
                section: "Activity",
                links: [
                    { label: "Complaints", path: "/admin/complaints", icon: MessageSquareWarning },
                    { label: "Settings",   path: "/admin/settings",   icon: Settings            },
                ],
            },
        ],
    },

    lecturer: {
        portalLabel: "Lecturer Portal",
        sections: [
            {
                section: "My Portal",
                links: [
                    { label: "My Timetable", path: "/lecturer/timetable",  icon: CalendarDays         },
                    { label: "Complaints",   path: "/lecturer/complaints",  icon: MessageSquareWarning },
                ],
            },
        ],
    },

    student: {
        portalLabel: "Student Portal",
        sections: [
            {
                section: "My Portal",
                links: [
                    { label: "My Timetable", path: "/student/timetable",  icon: CalendarDays         },
                    { label: "Complaints",   path: "/student/complaints",  icon: MessageSquareWarning },
                ],
            },
        ],
    },
};

// ── Constants ─────────────────────────────────────────────────────────────────

const MIN_WIDTH  = 72;
const MAX_WIDTH  = 400;
const SNAP_WIDTH = 120;
const DEFAULT_WIDTH = 300;

// ── Props ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    onWidthChange?: (width: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const Sidebar = ({ collapsed, setCollapsed, onWidthChange }: SidebarProps) => {
    const { user }   = useContext(AppContext);
    const location   = useLocation();
    const navigate   = useNavigate();

    const role       = (user?.role ?? "admin") as keyof typeof NAV_CONFIG;
    const config     = NAV_CONFIG[role] ?? NAV_CONFIG.admin;

    const [width, setWidth] = useState(collapsed ? MIN_WIDTH : DEFAULT_WIDTH);
    const isDragging        = useRef(false);
    const startX            = useRef(0);
    const startWidth        = useRef(0);
    const sidebarRef        = useRef<HTMLElement>(null);

    const updateWidth = useCallback((w: number) => {
        setWidth(w);
        onWidthChange?.(w);
    }, [onWidthChange]);

    // Sync width when collapsed prop changes via chevron
    useEffect(() => {
        updateWidth(collapsed ? MIN_WIDTH : DEFAULT_WIDTH);
    }, [collapsed]);

    // ── Drag logic ────────────────────────────────────────────────────────────

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current             = true;
        startX.current                 = e.clientX;
        startWidth.current             = sidebarRef.current?.offsetWidth ?? width;
        document.body.style.cursor     = "col-resize";
        document.body.style.userSelect = "none";
    }, [width]);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + e.clientX - startX.current));
            updateWidth(newWidth);
            setCollapsed(newWidth < SNAP_WIDTH);
        };
        const onMouseUp = () => {
            if (!isDragging.current) return;
            isDragging.current             = false;
            document.body.style.cursor     = "";
            document.body.style.userSelect = "";
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup",   onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup",   onMouseUp);
        };
    }, [setCollapsed, updateWidth]);

    const handleToggle = () => {
        const next = !isCollapsed;
        setCollapsed(next);
        updateWidth(next ? MIN_WIDTH : DEFAULT_WIDTH);
    };

    const handleLogout = () => {
        try { localStorage.removeItem("timely_auth"); } catch { /* ignore */ }
        navigate("/login");
    };

    const isCollapsed = width < SNAP_WIDTH;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <aside
            ref={sidebarRef}
            style={{ width }}
            className="fixed top-0 left-0 h-screen z-50 flex flex-col bg-[var(--gray-dark)] text-white transition-none select-none"
        >
            {/* ── Logo + toggle ── */}
            <div className={`flex items-center border-b border-white/10 h-[73px] px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary-200)] flex items-center justify-center shrink-0">
                            <CalendarDays className="w-4 h-4 text-[var(--gray-dark)]" />
                        </div>
                        <div className="leading-tight min-w-0">
                            <p className="text-sm font-bold tracking-wide text-white truncate">TIMELY</p>
                            <p className="text-[10px] text-[var(--primary-200)] font-medium tracking-widest uppercase truncate">
                                {config.portalLabel}
                            </p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleToggle}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-[var(--primary-200)] hover:text-[var(--gray-dark)] flex items-center justify-center transition-all duration-200 shrink-0"
                >
                    {isCollapsed
                        ? <ChevronRight className="w-3.5 h-3.5" />
                        : <ChevronLeft  className="w-3.5 h-3.5" />
                    }
                </button>
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-none">
                {config.sections.map(({ section, links }) => (
                    <div key={section}>
                        {!isCollapsed && (
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
                                            title={isCollapsed ? label : undefined}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                text-sm font-medium transition-all duration-200
                                                group relative
                                                ${isActive
                                                    ? "bg-[var(--primary-200)] text-[var(--gray-dark)]"
                                                    : "text-white/60 hover:text-white hover:bg-white/10"
                                                }
                                                ${isCollapsed ? "justify-center" : ""}
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[var(--gray-dark)]" : ""}`} />

                                            {!isCollapsed && <span className="truncate">{label}</span>}

                                            {/* Active dot */}
                                            {isActive && !isCollapsed && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gray-dark)] shrink-0" />
                                            )}

                                            {/* Collapsed tooltip */}
                                            {isCollapsed && (
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

            {/* ── Logout ── */}
            <div className={`border-t border-white/10 px-3 py-4 ${isCollapsed ? "flex justify-center" : ""}`}>
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Logout" : undefined}
                    className={`
                        group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                        text-sm font-medium text-white/60
                        hover:bg-red-500/20 hover:text-red-400
                        transition-all duration-200
                        ${isCollapsed ? "justify-center" : ""}
                    `}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                    {isCollapsed && (
                        <span className="
                            absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
                            bg-[var(--gray-dark)] border border-white/10
                            text-white text-xs font-medium whitespace-nowrap
                            opacity-0 pointer-events-none
                            group-hover:opacity-100 transition-opacity duration-150
                            shadow-lg z-50
                        ">
                            Logout
                        </span>
                    )}
                </button>
            </div>

            {/* ── Drag handle (right edge) ── */}
            <div
                onMouseDown={onMouseDown}
                className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize group z-60"
            >
                <div className="h-full w-full group-hover:bg-[var(--primary-200)]/40 transition-colors duration-150" />
            </div>
        </aside>
    );
};

export default Sidebar;