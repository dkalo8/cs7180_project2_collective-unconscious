import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CreateLogPage from "./pages/CreateLogPage";
import LogDetailPage from "./pages/LogDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import AboutPage from "./pages/AboutPage";
import ModerationPage from "./pages/ModerationPage";
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
        path: "users/:id",
        element: <UserProfilePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "moderation",
        element: <ModerationPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routerConfig);
export default routerConfig;
