import { useMemo } from "react";

import { places } from "../data/map/places";
import { useMapState } from "../features/map-state/useMapState";
import { MapBottomSheet } from "../features/map-bottom-sheet/MapBottomSheet";
import { filterPlaces } from "../shared/map/filterPlaces";
import { useDebouncedValue } from "../shared/search/useDebouncedValue";
import { getLocalPlaces } from "../shared/storage/localPlacesStorage";
import { MapView } from "../widgets/MapView/MapView";
import { MapSidebar } from "../widgets/MapSidebar/MapSidebar";

import "./MapPage.css";

export function MapPage() {
    const mapState = useMapState();
    const debouncedSearch = useDebouncedValue(mapState.search, 250);

    const allPlaces = useMemo(() => {
        return [...places, ...getLocalPlaces()];
    }, []);

    const filteredPlaces = useMemo(() => {
        return filterPlaces(allPlaces, {
            category: mapState.category,
            search: debouncedSearch,
        });
    }, [allPlaces, mapState.category, debouncedSearch]);

    const selectedPlace = useMemo(() => {
        return allPlaces.find((place) => String(place.id) === mapState.selectedPlaceId) ?? null;
    }, [allPlaces, mapState.selectedPlaceId]);

    const hoveredPlace = useMemo(() => {
        return allPlaces.find((place) => String(place.id) === mapState.hoveredPlaceId) ?? null;
    }, [allPlaces, mapState.hoveredPlaceId]);

    function handleSelectPlace(place) {
        mapState.setSelectedPlaceId(String(place.id));
    }

    function handleHoverPlace(place) {
        mapState.setHoveredPlaceId(place ? String(place.id) : null);
    }

    function handleSelectCategory(categoryId) {
        mapState.clearSelectedPlace();
        mapState.setCategory(categoryId);
    }

    function handleSearchChange(value) {
        mapState.clearSelectedPlace();
        mapState.setSearch(value);
    }

    function renderSidebar(isMobileSheet = false) {
        return (
            <MapSidebar
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                hoveredPlace={hoveredPlace}
                activeCategory={mapState.category}
                search={mapState.search}
                isMobileSheet={isMobileSheet}
                onSelectCategory={handleSelectCategory}
                onSelectPlace={handleSelectPlace}
                onClearSelected={mapState.clearSelectedPlace}
                onSearchChange={handleSearchChange}
                onHoverPlace={handleHoverPlace}
            />
        );
    }

    return (
        <main className="map-page">
            <section className="map-shell">
                <div className="map-area">
                    <MapView
                        places={filteredPlaces}
                        selectedPlace={selectedPlace}
                        hoveredPlace={hoveredPlace}
                        onSelectPlace={handleSelectPlace}
                        onHoverPlace={handleHoverPlace}
                    />
                </div>

                <div className="map-sidebar-desktop">{renderSidebar()}</div>

                <MapBottomSheet
                    state={mapState.sheetState}
                    onStateChange={mapState.setSheetState}
                >
                    {renderSidebar(true)}
                </MapBottomSheet>
            </section>
        </main>
    );
}