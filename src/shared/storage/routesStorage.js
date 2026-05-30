const ROUTES_KEY = "nativeplaces-routes";

function createRouteId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `route-${Date.now()}`;
}

export function getRoutes() {
    try {
        const rawValue = localStorage.getItem(ROUTES_KEY);

        if (!rawValue) {
            return [];
        }

        const routes = JSON.parse(rawValue);

        return Array.isArray(routes) ? routes : [];
    } catch {
        return [];
    }
}

export function getActiveRoutes() {
    return getRoutes().filter((route) => route.status !== "archived");
}

export function getArchivedRoutes() {
    return getRoutes().filter((route) => route.status === "archived");
}

export function saveRoute(route) {
    const routes = getRoutes();
    const createdAt = new Date().toISOString();

    const newRoute = {
        id: createRouteId(),
        title: route.title,
        description: route.description,
        places: route.places ?? [],
        status: "active",
        createdAt,
        completedAt: null,
    };

    const updatedRoutes = [newRoute, ...routes];

    localStorage.setItem(ROUTES_KEY, JSON.stringify(updatedRoutes));

    return updatedRoutes;
}

export function archiveRoute(routeId) {
    const completedAt = new Date().toISOString();

    const updatedRoutes = getRoutes().map((route) => {
        if (String(route.id) !== String(routeId)) {
            return route;
        }

        return {
            ...route,
            status: "archived",
            completedAt,
        };
    });

    localStorage.setItem(ROUTES_KEY, JSON.stringify(updatedRoutes));

    return updatedRoutes;
}

export function deleteRoute(routeId) {
    const updatedRoutes = getRoutes().filter((route) => {
        return String(route.id) !== String(routeId);
    });

    localStorage.setItem(ROUTES_KEY, JSON.stringify(updatedRoutes));

    return updatedRoutes;
}

export function restoreRoute(routeId) {
    const updatedRoutes = getRoutes().map((route) => {
        if (String(route.id) !== String(routeId)) {
            return route;
        }

        return {
            ...route,
            status: "active",
            completedAt: null,
        };
    });

    localStorage.setItem(ROUTES_KEY, JSON.stringify(updatedRoutes));

    return updatedRoutes;
}