import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { MAP_CATEGORY_ALL } from "../../data/map/categories";
import { MAP_SHEET_STATES, MAP_URL_PARAMS } from "./mapStateConstants";
import {
    getPlaceIdFromParams,
    getSearchFromParams,
    getValidCategoryFromParams,
    updateMapSearchParams,
} from "./mapUrlState";

export function useMapState() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
    const [sheetState, setSheetState] = useState(MAP_SHEET_STATES.COLLAPSED);

    const category = getValidCategoryFromParams(searchParams);
    const selectedPlaceId = getPlaceIdFromParams(searchParams);
    const search = getSearchFromParams(searchParams);

    function patchUrlParams(changes) {
        setSearchParams((currentParams) => updateMapSearchParams(currentParams, changes));
    }

    function setCategory(categorySlug) {
        patchUrlParams({
            [MAP_URL_PARAMS.CATEGORY]: categorySlug === MAP_CATEGORY_ALL ? null : categorySlug,
            [MAP_URL_PARAMS.PLACE]: null,
        });
        setSheetState(MAP_SHEET_STATES.HALF);
    }

    function setSelectedPlaceId(placeId) {
        patchUrlParams({
            [MAP_URL_PARAMS.PLACE]: placeId,
        });
        setSheetState(MAP_SHEET_STATES.HALF);
    }

    function clearSelectedPlace() {
        patchUrlParams({
            [MAP_URL_PARAMS.PLACE]: null,
        });
        setSheetState(MAP_SHEET_STATES.HALF);
    }

    function setSearch(searchValue) {
        patchUrlParams({
            [MAP_URL_PARAMS.SEARCH]: searchValue,
            [MAP_URL_PARAMS.PLACE]: null,
        });
        setSheetState(MAP_SHEET_STATES.HALF);
    }

    return {
        category,
        selectedPlaceId,
        search,
        hoveredPlaceId,
        sheetState,
        setCategory,
        setSelectedPlaceId,
        clearSelectedPlace,
        setSearch,
        setHoveredPlaceId,
        setSheetState,
    };
}
