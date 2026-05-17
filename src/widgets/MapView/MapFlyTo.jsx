import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapFlyTo({ selectedPlace }) {
    const map = useMap();

    useEffect(() => {
        if (!selectedPlace?.position) return;

        map.flyTo(selectedPlace.position, 11, {
            duration: 1.6,
        });

        const shiftTimer = window.setTimeout(() => {
            const isMobile = window.innerWidth <= 860;

            if (!isMobile) {
                map.panBy([180, 0], {
                    animate: true,
                    duration: 0.8,
                });
            }
        }, 900);

        return () => {
            window.clearTimeout(shiftTimer);
        };
    }, [map, selectedPlace]);

    return null;
}