import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { placesApi } from "../shared/api/placesApi";
import { useMapState } from "../features/map-state/useMapState";
import { MapBottomSheet } from "../features/map-bottom-sheet/MapBottomSheet";
import { filterPlaces } from "../shared/map/filterPlaces";
import { useDebouncedValue } from "../shared/search/useDebouncedValue";
import { MapView } from "../widgets/MapView/MapView";
import { MapSidebar } from "../widgets/MapSidebar/MapSidebar";

import "./MapPage.css";

export function MapPage() {
    const [searchParams] = useSearchParams();

    const queryCategory = searchParams.get("category") || "";
    const queryPlaceId = searchParams.get("place") || "";

    const mapState = useMapState();
    const debouncedSearch = useDebouncedValue(mapState.search, 250);

    const [allPlaces, setAllPlaces] = useState([]);
    const [placesLoading, setPlacesLoading] = useState(true);
    const [placesError, setPlacesError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadMapPlaces() {
            try {
                const data = await placesApi.getMapPlaces();

                if (!isMounted) {
                    return;
                }

                setAllPlaces(Array.isArray(data.places) ? data.places : []);
                setPlacesError("");
            } catch (error) {
                console.error("Не удалось загрузить объекты карты:", error);

                if (isMounted) {
                    setAllPlaces([]);
                    setPlacesError(
                        error.message || "Не удалось загрузить объекты карты."
                    );
                }
            } finally {
                if (isMounted) {
                    setPlacesLoading(false);
                }
            }
        }

        loadMapPlaces();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (placesLoading || placesError) {
            return;
        }

        if (queryCategory && mapState.category !== queryCategory) {
            mapState.setCategory(queryCategory, {
                keepSelectedPlace: true,
            });
        }

        if (!queryPlaceId) {
            return;
        }

        const targetPlace = allPlaces.find((place) => {
            return String(place.id) === String(queryPlaceId);
        });

        if (!targetPlace) {
            return;
        }

        if (mapState.selectedPlaceId !== String(targetPlace.id)) {
            mapState.setSelectedPlaceId(String(targetPlace.id));
        }
    }, [
        allPlaces,
        placesLoading,
        placesError,
        queryCategory,
        queryPlaceId,
        mapState,
    ]);

    const filteredPlaces = useMemo(() => {
        return filterPlaces(allPlaces, {
            category: mapState.category,
            search: debouncedSearch,
        });
    }, [allPlaces, mapState.category, debouncedSearch]);

    const selectedPlace = useMemo(() => {
        return (
            allPlaces.find((place) => {
                return String(place.id) === mapState.selectedPlaceId;
            }) ?? null
        );
    }, [allPlaces, mapState.selectedPlaceId]);

    const hoveredPlace = useMemo(() => {
        return (
            allPlaces.find((place) => {
                return String(place.id) === mapState.hoveredPlaceId;
            }) ?? null
        );
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

                <div className="map-sidebar-desktop">
                    {placesLoading && <p>Загружаем объекты...</p>}
                    {placesError && <p>{placesError}</p>}
                    {!placesLoading && !placesError && renderSidebar()}
                </div>

                <MapBottomSheet
                    state={mapState.sheetState}
                    onStateChange={mapState.setSheetState}
                >
                    {placesLoading && <p>Загружаем объекты...</p>}
                    {placesError && <p>{placesError}</p>}
                    {!placesLoading && !placesError && renderSidebar(true)}
                </MapBottomSheet>
            </section>
        </main>
    );
}