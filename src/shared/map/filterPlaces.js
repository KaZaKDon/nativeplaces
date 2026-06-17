import { MAP_CATEGORY_ALL } from "../../shared/config/categoryConfig";
import { buildPlaceSearchText } from "./buildPlaceSearchText";
import { normalizeSearchText } from "../search/normalizeSearchText";

function placeMatchesCategory(place, category) {
    return category === MAP_CATEGORY_ALL || place.categorySlug === category;
}

function placeMatchesSearch(place, search) {
    if (!search) {
        return true;
    }

    const searchableText = buildPlaceSearchText(place);

    return searchableText.includes(search);
}

export function filterPlaces(places, { category = MAP_CATEGORY_ALL, search = "" } = {}) {
    const normalizedSearch = normalizeSearchText(search);

    return places.filter((place) => {
        return (
            placeMatchesCategory(place, category) &&
            placeMatchesSearch(place, normalizedSearch)
        );
    });
}