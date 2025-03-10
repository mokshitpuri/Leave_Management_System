import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/DashboardPage";
import DrawerContextProvider from "./context/DrawerContextProvider";
import Home from "./pages/HomePage";
import ApplyPage from "./pages/ApplyPage";
import { Navigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import RecordsPage from "./pages/RecordsPage";
import ApplicationPage from "./pages/ApplicationPage";

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
]);

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <DrawerContextProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />;
        </QueryClientProvider>
      </DrawerContextProvider>
    </>
  );
}

export default App;
