import { MAP_CATEGORY_ALL } from "../../data/map/categories";

export function filterPlacesByCategory(places = [], categorySlug = MAP_CATEGORY_ALL) {
    if (categorySlug === MAP_CATEGORY_ALL) return places;

    return places.filter((place) => place.categorySlug === categorySlug);
}
