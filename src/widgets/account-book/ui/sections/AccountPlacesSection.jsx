import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { myPlacesApi } from "../../../../shared/api/myPlacesApi";
import { AccountBookPager } from "../components/AccountBookPager";
import { AccountPlaceCard } from "../components/AccountPlaceCard";

export function AccountPlacesSection() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadPlaces() {
            try {
                const data = await myPlacesApi.getMyPlaces();

                if (!isMounted) {
                    return;
                }

                setPlaces(data.places);
            } catch (error) {
                console.error("Не удалось загрузить мои места:", error);

                if (isMounted) {
                    setPlaces([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadPlaces();

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleDeletePlace(placeId) {
        const isConfirmed = window.confirm(
            "Переместить объект в архив?"
        );

        if (!isConfirmed) {
            return;
        }

        try {
            await myPlacesApi.deleteMyPlace(placeId);

            setPlaces((currentPlaces) =>
                currentPlaces.filter(
                    (place) => String(place.id) !== String(placeId)
                )
            );
        } catch (error) {
            console.error(error);

            window.alert(
                error.message || "Не удалось удалить объект"
            );
        }
    }

    return (
        <div className="account-book-section">
            <h1>Мои места</h1>

            {loading && (
                <p>Загрузка объектов...</p>
            )}

            {!loading && places.length === 0 && (
                <p>
                    Ваши объекты будут загружаться из базы данных.
                </p>
            )}

            <Link className="account-book-section__button" to="/submit">
                Добавить место
            </Link>

            {!loading && places.length === 0 ? (
                <div className="account-book-empty">
                    <h2>Пока нет добавленных мест</h2>

                    <p>
                        Добавьте объект, выберите координаты на карте,
                        и запись появится здесь.
                    </p>
                </div>
            ) : (
                <AccountBookPager items={places}>
                    {(place) => (
                        <AccountPlaceCard
                            place={place}
                            onDelete={handleDeletePlace}
                        />
                    )}
                </AccountBookPager>
            )}
        </div>
    );
}