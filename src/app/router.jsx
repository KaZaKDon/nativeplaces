import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { HomePage } from "../pages/HomePage";
import { MapPage } from "../pages/MapPage";
import { CategoriesPage } from "../pages/CategoriesPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "map",
                element: <MapPage />,
            },
            {
                path: "categories",
                element: <CategoriesPage />,
            },
        ],
    },
]);