import L from "leaflet";

export function createMarkerIcon(icon) {
    return L.divIcon({
        className: "place-marker",
        html: `
        <div class="place-marker__inner">
            ${icon}
        </div>
    `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
}