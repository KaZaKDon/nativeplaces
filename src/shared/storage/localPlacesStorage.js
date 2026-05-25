const LOCAL_PLACES_KEY = "nativeplaces-user-places";

export function getLocalPlaces() {
    try {
        const rawValue = localStorage.getItem(LOCAL_PLACES_KEY);

        if (!rawValue) {
            return [];
        }

        const parsedPlaces = JSON.parse(rawValue);

        return Array.isArray(parsedPlaces) ? parsedPlaces : [];
    } catch {
        return [];
    }
}

export function getLocalPlaceById(placeId) {
    return getLocalPlaces().find((place) => {
        return String(place.id) === String(placeId);
    });
}

export function saveLocalPlace(place) {
    const currentPlaces = getLocalPlaces();
    const updatedPlaces = [...currentPlaces, place];

    localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(updatedPlaces));

    return place;
}

export function updateLocalPlace(placeId, updatedPlace) {
    const currentPlaces = getLocalPlaces();

    const updatedPlaces = currentPlaces.map((place) => {
        if (String(place.id) !== String(placeId)) {
            return place;
        }

        return {
            ...place,
            ...updatedPlace,
            id: place.id,
            createdAt: place.createdAt,
            updatedAt: new Date().toISOString(),
        };
    });

    localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(updatedPlaces));

    return updatedPlace;
}

export function deleteLocalPlace(placeId) {
    const currentPlaces = getLocalPlaces();

    const updatedPlaces = currentPlaces.filter((place) => {
        return String(place.id) !== String(placeId);
    });

    localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(updatedPlaces));

    return updatedPlaces;
}

export function clearLocalPlaces() {
    localStorage.removeItem(LOCAL_PLACES_KEY);
}