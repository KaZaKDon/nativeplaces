import { useState } from "react";

import {
    deleteRoute,
    getArchivedRoutes,
    restoreRoute,
} from "../../../../shared/storage/routesStorage";
import { AccountBookPager } from "../components/AccountBookPager";
import { AccountRouteCard } from "../components/AccountRouteCard";

export function AccountArchiveSection() {
    const [routes, setRoutes] = useState(() => getArchivedRoutes());

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

    return (
        <div className="account-book-section">
            <h1>Архив</h1>

            {routes.length === 0 ? (
                <div className="account-book-empty">
                    <h2>Архив пока пуст</h2>

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
        </div>
    );
}