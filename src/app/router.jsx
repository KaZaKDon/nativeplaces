import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { CategoriesPage } from "../pages/CategoriesPage";
import { HomePage } from "../pages/HomePage";
import { MapPage } from "../pages/MapPage";
import { PlacePage } from "../pages/PlacePage";

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
                path: "categories",
                element: <CategoriesPage />,
            },
            {
                path: "map",
                element: <MapPage />,
            },
            {
                path: "place/:slug",
                element: <PlacePage />,
            },
        ],
    },
]);