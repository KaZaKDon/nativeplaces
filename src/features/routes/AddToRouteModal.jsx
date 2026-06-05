import { useEffect, useState } from "react";

import { routesApi } from "../../shared/api/routesApi";

import "./AddToRouteModal.css";

export function AddToRouteModal({ place, onClose }) {
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchRoutes() {
            try {
                const data = await routesApi.getRoutes();

                if (!isMounted) {
                    return;
                }

                setRoutes(data.routes);
                setSelectedRouteId(data.routes[0]?.id ? String(data.routes[0].id) : "");
            } catch (error) {
                console.error(error);

                if (isMounted) {
                    setStatus(error.message || "Не удалось загрузить маршруты.");
                }
            }
        }

        fetchRoutes();

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleAddToRoute(event) {
        event.preventDefault();

        if (!selectedRouteId) {
            setStatus("Выберите маршрут.");
            return;
        }

        try {
            await routesApi.addPlaceToRoute({
                routeId: selectedRouteId,
                placeId: place.id,
            });

            setStatus("Объект добавлен в маршрут.");

            setTimeout(() => {
                onClose();
            }, 700);
        } catch (error) {
            console.error(error);
            setStatus(error.message || "Не удалось добавить объект в маршрут.");
        }
    }

    return (
        <div className="add-route-modal" role="dialog" aria-modal="true">
            <div className="add-route-modal__card">
                <button
                    className="add-route-modal__close"
                    type="button"
                    onClick={onClose}
                    aria-label="Закрыть окно"
                >
                    ×
                </button>

                <p className="add-route-modal__eyebrow">Добавить в маршрут</p>

                <h2>{place.title}</h2>

                {routes.length === 0 ? (
                    <div className="add-route-modal__empty">
                        <p>
                            У вас пока нет маршрутов. Создайте маршрут в кабинете,
                            а затем добавьте сюда объект.
                        </p>
                    </div>
                ) : (
                    <form className="add-route-form" onSubmit={handleAddToRoute}>
                        <label>
                            <span>Выберите маршрут</span>

                            <select
                                value={selectedRouteId}
                                onChange={(event) => {
                                    setSelectedRouteId(event.target.value);
                                    setStatus("");
                                }}
                            >
                                {routes.map((route) => (
                                    <option key={route.id} value={route.id}>
                                        {route.title}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {status && (
                            <p className="add-route-modal__status">
                                {status}
                            </p>
                        )}

                        <button className="add-route-form__submit" type="submit">
                            Добавить
                        </button>
                    </form>
                )}

                {routes.length === 0 && status && (
                    <p className="add-route-modal__status">{status}</p>
                )}
            </div>
        </div>
    );
}