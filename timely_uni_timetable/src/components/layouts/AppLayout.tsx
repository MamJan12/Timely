import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import { useState } from "react";
import Header from "../common/Header";

const AppLayout = () =>
{
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="h-screen flex">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? "lg:ml-20" : "lg:ml-80"}`}>
                <Header />
                <div className=" p-4 ">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default AppLayout;