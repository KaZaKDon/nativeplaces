import L from "leaflet";

import {
    categoryColors
} from "./categoryColors";

export function createMarkerIcon(
    categorySlug,
    isActive = false,
    isHovered = false
) {
    const category = categoryColors[categorySlug];

    return L.divIcon({
        className: `
      map-marker
      ${isActive ? "is-active" : ""}
      ${isHovered ? "is-hovered" : ""}
    `,

        html: `
      <span
        style="
          --marker-color: ${category?.color};
          --marker-glow: ${category?.glow};
          --marker-ring: ${category?.ring};
        "
      ></span>
    `,

        iconSize: isActive ? [34, 34] : [26, 26],
        iconAnchor: isActive ? [17, 17] : [13, 13],
    });
}