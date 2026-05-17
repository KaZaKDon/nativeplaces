import { useMemo, useState } from "react";

import { MapSidebar } from "../widgets/MapSidebar/MapSidebar";
import { places } from "../data/map/places";
import { MapView } from "../widgets/MapView/MapView";

import "./MapPage.css";

export function MapPage() {
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [hoveredPlace, setHoveredPlace] = useState(null);

    const filteredPlaces = useMemo(() => {
        if (activeCategory === "all") return places;

        return places.filter((place) => place.categorySlug === activeCategory);
    }, [activeCategory]);

    function handleSelectCategory(categorySlug) {
        setActiveCategory(categorySlug);
        setSelectedPlace(null);
    }

    function handleSelectPlace(place) {
        setSelectedPlace(place);
    }

    function handleClearSelected() {
        setSelectedPlace(null);
    }

    return (
        <main className="map-page">
            <section className="map-shell">
                <div className="map-area">
                    <MapView
                        places={filteredPlaces}
                        selectedPlace={selectedPlace}
                        onSelectPlace={handleSelectPlace}
                        hoveredPlace={hoveredPlace}
                    />
                </div>

                <MapSidebar
                    places={filteredPlaces}
                    selectedPlace={selectedPlace}
                    activeCategory={activeCategory}
                    onSelectCategory={handleSelectCategory}
                    onSelectPlace={handleSelectPlace}
                    onClearSelected={handleClearSelected}
                    onHoverPlace={setHoveredPlace}
                />
            </section>
        </main>
    );
}