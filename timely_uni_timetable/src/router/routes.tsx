import ErrorPage from "../pages/ErrorPage";
import AdminDashboard from "../pages/adminDashboard";
import AppLayout from "../components/layouts/AppLayout";
import { createBrowserRouter, redirect } from "react-router-dom";
import { getUserRole } from "../utils/authRedirect";

const roleLoader = () => {
  const role = getUserRole();

  if (role === "admin")    return redirect("/admin/dashboard");
  if (role === "lecturer") return redirect("/lecturer/dashboard");
  if (role === "student")  return redirect("/student/dashboard");

  // Not logged in
  return redirect("/login");
};

const routes = createBrowserRouter([
  {
    path: "/",
    loader: roleLoader,
    errorElement: <ErrorPage />,
  },

  // ── Admin ──────────────────────────────────────────────
  {
    path: "/admin",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
    ],
  },

  // ── Lecturer — not built yet, hits ErrorPage ───────────
  {
    path: "/lecturer/dashboard",
    errorElement: <ErrorPage />,
    loader: () => { throw new Error("Lecturer dashboard coming soon."); },
  },

  // ── Student — not built yet, hits ErrorPage ────────────
  {
    path: "/student/dashboard",
    errorElement: <ErrorPage />,
    loader: () => { throw new Error("Student dashboard coming soon."); },
  },

  // ── Catch-all ──────────────────────────────────────────
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default routes;