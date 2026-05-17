import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";

import { createMarkerIcon } from "../../shared/map/createMarkerIcon";

import { MapFlyTo } from "./MapFlyTo";

export function MapView({
    places = [],
    selectedPlace,
    onSelectPlace,
    hoveredPlace,
}) {
    return (
        <MapContainer
            center={[47.2, 40.1]}
            zoom={7}
            scrollWheelZoom
            className="native-map"
        >
            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFlyTo selectedPlace={selectedPlace} />

            {places.map((place) => (
                <Marker
                    key={place.id}
                    position={place.position}
                    icon={createMarkerIcon(
                        place.categorySlug,
                        selectedPlace?.id === place.id,
                        hoveredPlace?.id === place.id
                    )}
                    eventHandlers={{
                        click: () => onSelectPlace(place),
                    }}
                >
                    <Tooltip
                        direction="top"
                        offset={[0, -18]}
                        opacity={1}
                        className="map-tooltip"
                    >
                        <span
                            style={{
                                color: `var(--tooltip-color-${place.categorySlug})`,
                            }}
                        >
                            {place.title}
                        </span>
                    </Tooltip>
                </Marker>
            ))}
        </MapContainer>
    );
}