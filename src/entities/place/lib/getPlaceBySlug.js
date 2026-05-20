export function getPlaceBySlug(places, slug) {
    return places.find((place) => place.slug === slug) ?? null;
}