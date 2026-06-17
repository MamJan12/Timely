import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import { useState, useCallback } from "react";

const AppLayout = () => {
    const [collapsed,    setCollapsed]    = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(300); // matches Sidebar DEFAULT_WIDTH

    // Sidebar calls this whenever it resizes so the main area stays in sync
    const handleWidthChange = useCallback((w: number) => {
        setSidebarWidth(w);
    }, []);

    return (
        <div className="h-screen flex overflow-hidden">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onWidthChange={handleWidthChange}
            />

            {/* Main content — margin-left always equals the sidebar's actual pixel width */}
            <main
                className="flex-1 flex flex-col min-w-0 overflow-hidden"
                style={{ marginLeft: sidebarWidth }}
            >
                <Header />
                <div className="flex-1 overflow-y-auto p-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;