import LoginPage from "../pages/auth/LoginPage";



const routes = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect("/admin/dashboard"),
    // errorElement: <ErrorPage />
  },
  {
    path: "/admin/login",
    element: <LoginPage />,
    loader: guestRoute,

  },
  {
    path: "/admin",
    element: <AppLayout />,
    loader: protectRoutes([]),
    children: [{
      path: "dashboard",
      element: <DashboardPage />,
    },
    {
      path: "users",
      element: <Users/>
    },