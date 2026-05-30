import { useState } from "react";

import { places } from "../../../../data/map/places";
import { getLocalPlaces } from "../../../../shared/storage/localPlacesStorage";
import {
    getFavoriteIds,
    removeFavorite,
} from "../../../../shared/storage/favoritesStorage";
import { AccountBookPager } from "../components/AccountBookPager";
import { AccountFavoriteCard } from "../components/AccountFavoriteCard";

export function AccountFavoritesSection() {
    const [favoriteIds, setFavoriteIds] = useState(() => getFavoriteIds());

    const allPlaces = [...places, ...getLocalPlaces()];

    const favoritePlaces = allPlaces.filter((place) => {
        return favoriteIds.includes(String(place.id));
    });

    function handleRemoveFavorite(placeId) {
        const updatedFavorites = removeFavorite(placeId);
        setFavoriteIds(updatedFavorites);
    }

    return (
        <div className="account-book-section">
            <h1>Избранное</h1>

            {favoritePlaces.length === 0 ? (
                <div className="account-book-empty">
                    <h2>Пока нет избранных мест</h2>

                    <p>
                        Откройте карточку объекта и нажмите “В избранное”.
                    </p>
                </div>
            ) : (
                <AccountBookPager items={favoritePlaces}>
                    {(place) => (
                        <AccountFavoriteCard
                            place={place}
                            onRemove={handleRemoveFavorite}
                        />
                    )}
                </AccountBookPager>
            )}
        </div>
    );
}