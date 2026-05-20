export function getPlaceImages(place) {
    if (!place) {
        return [];
    }

    return [place.image, ...(place.gallery ?? [])].filter(Boolean);
}