import { useState } from "react";
import { Link } from "react-router-dom";

import { formatAccountDate } from "../entities/account/lib/formatAccountDate";
import {
    deleteLocalPlace,
    getLocalPlaces,
} from "../shared/storage/localPlacesStorage";

import "./AccountPage.css";

export function AccountPlacesPage() {
    const [localPlaces, setLocalPlaces] = useState(() => getLocalPlaces());

    function handleDeletePlace(placeId) {
        const isConfirmed = window.confirm("Удалить это место из локального кабинета?");

        if (!isConfirmed) {
            return;
        }

        const updatedPlaces = deleteLocalPlace(placeId);

        setLocalPlaces(updatedPlaces);
    }

    return (
        <main className="account-page">
            <section className="account-page__hero">
                <Link className="account-page__back" to="/account">
                    ← В кабинет
                </Link>

                <p className="account-page__eyebrow">Мои места</p>

                <h1>Добавленные объекты</h1>

                {localPlaces.length === 0 ? (
                    <div className="account-empty">
                        <h2>Пока нет добавленных мест</h2>
                        <p>
                            Добавьте объект через форму, выберите точку на карте,
                            и он появится здесь.
                        </p>

                        <Link className="account-empty__button" to="/submit">
                            Добавить место
                        </Link>
                    </div>
                ) : (
                    <div className="account-places">
                        {localPlaces.map((place) => (
                            <article className="account-place-card" key={place.id}>
                                <div className="account-place-card__content">
                                    <span className="account-place-card__category">
                                        {place.categoryTitle || "Без категории"}
                                    </span>

                                    <h2>{place.title}</h2>

                                    <p>
                                        {place.shortDescription ||
                                            place.description ||
                                            "Описание пока не добавлено."}
                                    </p>

                                    <div className="account-place-card__meta">
                                        <span>{place.locality || "Локация не указана"}</span>
                                        <span>{formatAccountDate(place.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="account-place-card__actions">
                                    <Link
                                        className="account-place-card__button"
                                        to={`/map?category=${place.categorySlug}&place=${place.id}`}
                                    >
                                        На карте
                                    </Link>

                                    <button
                                        className="account-place-card__button account-place-card__button--danger"
                                        type="button"
                                        onClick={() => handleDeletePlace(place.id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}