const FAVORITES_KEY = "nativeplaces-favorites";

export function getFavoriteIds() {
    try {
        const rawValue = localStorage.getItem(FAVORITES_KEY);

        if (!rawValue) {
            return [];
        }

        const parsedValue = JSON.parse(rawValue);

        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
        return [];
    }
}

export function isFavorite(placeId) {
    return getFavoriteIds().includes(String(placeId));
}

export function addFavorite(placeId) {
    const currentFavorites = getFavoriteIds();

    const nextFavorites = [...new Set([
        ...currentFavorites,
        String(placeId),
    ])];

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));

    return nextFavorites;
}

export function removeFavorite(placeId) {
    const nextFavorites = getFavoriteIds().filter((id) => {
        return String(id) !== String(placeId);
    });

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));

    return nextFavorites;
}

export function toggleFavorite(placeId) {
    if (isFavorite(placeId)) {
        return removeFavorite(placeId);
    }

    return addFavorite(placeId);
}