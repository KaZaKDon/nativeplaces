import { useState } from "react";

import {
    archiveRoute,
    getActiveRoutes,
    saveRoute,
} from "../../../../shared/storage/routesStorage";
import { AccountBookPager } from "../components/AccountBookPager";
import { AccountRouteCard } from "../components/AccountRouteCard";
import { RouteCreateModal } from "../components/RouteCreateModal";

import "./AccountRoutesSection.css";

export function AccountRoutesSection() {
    const [routes, setRoutes] = useState(() => getActiveRoutes());
    const [modalOpen, setModalOpen] = useState(false);

    function handleCreateRoute(route) {
        saveRoute(route);
        setRoutes(getActiveRoutes());
        setModalOpen(false);
    }

    function handleArchiveRoute(routeId) {
        const isConfirmed = window.confirm("Перенести маршрут в архив?");

        if (!isConfirmed) {
            return;
        }

        archiveRoute(routeId);
        setRoutes(getActiveRoutes());
    }

    return (
        <div className="account-book-section">
            <h1>Маршруты</h1>

            <button
                className="account-book-section__button account-routes__create"
                type="button"
                onClick={() => setModalOpen(true)}
            >
                Создать маршрут
            </button>

            {routes.length === 0 ? (
                <div className="account-book-empty">
                    <h2>Создайте первый маршрут</h2>

                    <p>
                        Соберите поездку, рыбалку, охоту или путешествие
                        по родным местам.
                    </p>
                </div>
            ) : (
                <div className="account-book-section__body">
                    <AccountBookPager items={routes}>
                        {(route) => (
                            <AccountRouteCard
                                route={route}
                                onArchive={handleArchiveRoute}
                            />
                        )}
                    </AccountBookPager>
                </div>
            )}

            {modalOpen && (
                <RouteCreateModal
                    onClose={() => setModalOpen(false)}
                    onCreate={handleCreateRoute}
                />
            )}
        </div>
    );
}