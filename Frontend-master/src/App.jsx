import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/DashboardPage";
import DrawerContextProvider from "./context/DrawerContextProvider";
import Home from "./pages/HomePage";
import ApplyPage from "./pages/ApplyPage";
import { Navigate } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import RecordsPage from "./pages/RecordsPage";
import ApplicationPage from "./pages/ApplicationPage";
import AddUserPage from "./pages/AddUserPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ApplicationsPage from "./pages/ApplicationsPage"; // Import the applications page component

const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "/dashboard/home",
        element: <Home />,
        index: true,
      },
      {
        path: "/dashboard/apply",
        element: <ApplyPage />,
      },
      {
        path: "/dashboard/records",
        element: <RecordsPage />,
      },
      {
        path: "/dashboard/applications",
        element: <ApplicationPage />,
      },
      {
        path: "/dashboard/add-user",
        element: <AddUserPage />,
      },
      {
        path: "/dashboard/manage-users",
        element: <ManageUsersPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
  {
    path: "/applications",
    element: <ApplicationsPage />,
  }, // Ensure this route exists and points to the correct component
]);

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <DrawerContextProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </DrawerContextProvider>
    </>
  );
}

export default App;
