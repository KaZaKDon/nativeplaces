import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { AccountPage } from "../pages/AccountPage";
import { AuthPage } from "../pages/AuthPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { HomePage } from "../pages/HomePage";
import { MapPage } from "../pages/MapPage";
import { PlacePage } from "../pages/PlacePage";
import { SubmitLocationPage } from "../pages/SubmitLocationPage";
import { SubmitPage } from "../pages/SubmitPage";
import { RequireAuth } from "../shared/auth/RequireAuth";
import { RoutePage } from "../pages/RoutePage";
import { SharedRoutePage } from "../pages/SharedRoutePage";
import { NotFoundPage } from "../pages/NotFound/NotFoundPage";

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
                path: "auth",
                element: <AuthPage />,
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
                element: (
                    <RequireAuth>
                        <SubmitPage />
                    </RequireAuth>
                ),
            },
            {
                path: "submit/location",
                element: (
                    <RequireAuth>
                        <SubmitLocationPage />
                    </RequireAuth>
                ),
            },
            {
                path: "account",
                element: (
                    <RequireAuth>
                        <AccountPage />
                    </RequireAuth>
                ),
            },
            {
                path: "routes/:id",
                element: (
                    <RequireAuth>
                        <RoutePage />
                    </RequireAuth>
                ),
            },
            {
                path: "routes/share/:token",
                element: <SharedRoutePage />,
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]);