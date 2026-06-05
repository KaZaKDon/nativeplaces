import { useEffect, useState } from "react";

import { myPlacesApi } from "../../../../shared/api/myPlacesApi";
import {
    deleteRoute,
    getArchivedRoutes,
    restoreRoute,
} from "../../../../shared/storage/routesStorage";
import { AccountBookPager } from "../components/AccountBookPager";
import { AccountPlaceCard } from "../components/AccountPlaceCard";
import { AccountRouteCard } from "../components/AccountRouteCard";

export function AccountArchiveSection() {
    const [archiveView, setArchiveView] = useState("routes");

    const [routes, setRoutes] = useState(() => getArchivedRoutes());
    const [places, setPlaces] = useState([]);
    const [placesLoading, setPlacesLoading] = useState(false);
    const [placesError, setPlacesError] = useState("");

    useEffect(() => {
        if (archiveView !== "places") {
            return;
        }

        let isMounted = true;

        async function loadArchivedPlaces() {
            setPlacesLoading(true);
            setPlacesError("");

            try {
                const data = await myPlacesApi.getMyPlaces();

                if (!isMounted) {
                    return;
                }

                setPlaces(
                    data.places.filter((place) => place.status === "expired")
                );
            } catch (error) {
                console.error("Не удалось загрузить архив объявлений:", error);

                if (isMounted) {
                    setPlaces([]);
                    setPlacesError(
                        error.message || "Не удалось загрузить архив объявлений."
                    );
                }
            } finally {
                if (isMounted) {
                    setPlacesLoading(false);
                }
            }
        }

        loadArchivedPlaces();

        return () => {
            isMounted = false;
        };
    }, [archiveView]);

    function handleDeleteRoute(routeId) {
        const isConfirmed = window.confirm("Удалить маршрут из архива?");

        if (!isConfirmed) {
            return;
        }

        deleteRoute(routeId);
        setRoutes(getArchivedRoutes());
    }

    function handleRestoreRoute(routeId) {
        restoreRoute(routeId);
        setRoutes(getArchivedRoutes());
    }

    function handleSelectRoutesArchive() {
        setArchiveView("routes");
    }

    function handleSelectPlacesArchive() {
        setArchiveView("places");
    }

    return (
        <div className="account-book-section">
            <h1>Архив</h1>

            <div className="account-contact-modal__tabs">
                <button
                    type="button"
                    className={archiveView === "routes" ? "is-active" : ""}
                    onClick={handleSelectRoutesArchive}
                >
                    Архив маршрутов
                </button>

                <button
                    type="button"
                    className={archiveView === "places" ? "is-active" : ""}
                    onClick={handleSelectPlacesArchive}
                >
                    Архив объявлений
                </button>
            </div>

            {archiveView === "routes" && (
                <>
                    {routes.length === 0 ? (
                        <div className="account-book-empty">
                            <h2>Архив маршрутов пуст</h2>

                            <p>
                                Завершённые маршруты будут сохраняться здесь
                                как история поездок и путешествий.
                            </p>
                        </div>
                    ) : (
                        <div className="account-book-section__body">
                            <AccountBookPager items={routes}>
                                {(route) => (
                                    <div className="account-archive-route">
                                        <AccountRouteCard
                                            route={route}
                                            archiveLabel="Восстановить"
                                            onArchive={handleRestoreRoute}
                                        />

                                        <div className="account-archive-route__actions">
                                            <button
                                                className="account-book-place__action account-book-place__action--danger"
                                                type="button"
                                                onClick={() => handleDeleteRoute(route.id)}
                                            >
                                                Удалить из архива
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </AccountBookPager>
                        </div>
                    )}
                </>
            )}

            {archiveView === "places" && (
                <>
                    {placesLoading && <p>Загружаем архив объявлений...</p>}

                    {placesError && <p>{placesError}</p>}

                    {!placesLoading && !placesError && places.length === 0 ? (
                        <div className="account-book-empty">
                            <h2>Архив объявлений пуст</h2>

                            <p>
                                Здесь будут объекты, которые вы перенесли в архив.
                            </p>
                        </div>
                    ) : (
                        !placesLoading &&
                        !placesError && (
                            <div className="account-book-section__body">
                                <AccountBookPager items={places}>
                                    {(place) => (
                                        <AccountPlaceCard
                                            place={place}
                                            onDelete={() => {}}
                                        />
                                    )}
                                </AccountBookPager>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}