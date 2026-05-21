const LOCAL_PLACES_KEY = "nativeplaces-user-places";

export function getLocalPlaces() {
    try {
        const rawValue = localStorage.getItem(LOCAL_PLACES_KEY);

        if (!rawValue) {
            return [];
        }

        const parsedPlaces = JSON.parse(rawValue);

        if (!Array.isArray(parsedPlaces)) {
            return [];
        }

        return parsedPlaces;
    } catch {
        return [];
    }
}

export function saveLocalPlace(place) {
    const currentPlaces = getLocalPlaces();

    const updatedPlaces = [...currentPlaces, place];

    localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(updatedPlaces));

    return place;
}

export function clearLocalPlaces() {
    localStorage.removeItem(LOCAL_PLACES_KEY);
}