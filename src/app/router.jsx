import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { AccountPage } from "../pages/AccountPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { HomePage } from "../pages/HomePage";
import { MapPage } from "../pages/MapPage";
import { PlacePage } from "../pages/PlacePage";
import { SubmitLocationPage } from "../pages/SubmitLocationPage";
import { SubmitPage } from "../pages/SubmitPage";

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
            {
                path: "submit",
                element: <SubmitPage />,
            },
            {
                path: "submit/location",
                element: <SubmitLocationPage />,
            },
            {
                path: "account",
                element: <AccountPage />,
            },
        ],
    },
]);