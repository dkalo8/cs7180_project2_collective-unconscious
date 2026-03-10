import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CreateLogPage from "./pages/CreateLogPage";
import LogDetailPage from "./pages/LogDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

const routerConfig = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "create",
        element: <CreateLogPage />,
      },
      {
        path: "logs/:id",
        element: <LogDetailPage />,
      },
      {
        path: "profile/:username",
        element: <UserProfilePage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routerConfig);
export default routerConfig; // Export config for testing without BrowserRouter tied to DOM
