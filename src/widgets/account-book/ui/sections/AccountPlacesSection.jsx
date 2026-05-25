import { useState } from "react";
import { Link } from "react-router-dom";

import {
    deleteLocalPlace,
    getLocalPlaces,
} from "../../../../shared/storage/localPlacesStorage";
import { AccountPlaceCard } from "../components/AccountPlaceCard";

export function AccountPlacesSection() {
    const [places, setPlaces] = useState(() => getLocalPlaces());

    function handleDeletePlace(placeId) {
        const isConfirmed = window.confirm("Удалить это место из дневника?");

        if (!isConfirmed) {
            return;
        }

        const updatedPlaces = deleteLocalPlace(placeId);
        setPlaces(updatedPlaces);
    }

    return (
        <div className="account-book-section">
            <h1>Мои места</h1>

            <p>
                Объекты, которые вы добавили через форму. Пока они сохранены
                локально в этом браузере.
            </p>

            <Link className="account-book-section__button" to="/submit">
                Добавить место
            </Link>

            {places.length === 0 ? (
                <div className="account-book-empty">
                    <h2>Пока нет добавленных мест</h2>
                    <p>
                        Добавьте объект, выберите координаты на карте,
                        и запись появится здесь.
                    </p>
                </div>
            ) : (
                <div className="account-book-list">
                    {places.map((place) => (
                        <AccountPlaceCard
                            key={place.id}
                            place={place}
                            onDelete={handleDeletePlace}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}