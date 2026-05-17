import { useMemo, useState } from "react";

import "./MapSidebar.css";

const INITIAL_VISIBLE_COUNT = 15;
const LOAD_MORE_STEP = 15;

const categories = [
    { id: "all", title: "Все" },
    { id: "real-estate", title: "Недвижимость" },
    { id: "rent", title: "Аренда" },
    { id: "recreation", title: "Базы отдыха" },
    { id: "fishing", title: "Рыбалка" },
    { id: "hunting", title: "Охота" },
    { id: "nature", title: "Природа" },
];

export function MapSidebar({
    places = [],
    selectedPlace,
    activeCategory = "all",
    onSelectCategory,
    onSelectPlace,
    onClearSelected,
    onHoverPlace,
}) {
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const visiblePlaces = useMemo(() => {
        return places.slice(0, visibleCount);
    }, [places, visibleCount]);

    const hasMorePlaces = visibleCount < places.length;

    if (selectedPlace) {
        return (
            <aside className="map-sidebar">
                <button className="map-sidebar__back" type="button" onClick={onClearSelected}>
                    ← Назад к списку
                </button>

                <article className="place-panel">
                    <div className="place-panel__image">
                        {selectedPlace.image ? (
                            <img src={selectedPlace.image} alt={selectedPlace.title} />
                        ) : (
                            <span>Фото места</span>
                        )}
                    </div>

                    <p className="place-panel__category">{selectedPlace.categoryTitle}</p>

                    <h1>{selectedPlace.title}</h1>

                    {selectedPlace.price && (
                        <div className="place-panel__price">{selectedPlace.price}</div>
                    )}

                    <p className="place-panel__description">{selectedPlace.description}</p>

                    <div className="place-panel__meta">
                        {selectedPlace.area && <span>{selectedPlace.area}</span>}
                        {selectedPlace.landArea && <span>{selectedPlace.landArea}</span>}
                        {selectedPlace.locality && <span>{selectedPlace.locality}</span>}
                    </div>

                    <button className="place-panel__button" type="button">
                        Подробнее
                    </button>
                </article>
            </aside>
        );
    }

    return (
        <aside className="map-sidebar">
            <a className="map-sidebar__home" href="/">
                ← На главную
            </a>

            <div className="map-sidebar__head">
                <p className="map-sidebar__eyebrow">Карта мест</p>

                <h1>Исследуйте территорию</h1>

                <p>
                    Выберите категорию или точку на карте. Фильтры помогают оставить
                    только нужные объекты.
                </p>
            </div>

            <div className="map-sidebar__filters">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={
                            activeCategory === category.id
                                ? "map-sidebar__filter is-active"
                                : "map-sidebar__filter"
                        }
                        type="button"
                        onClick={() => {
                            setVisibleCount(INITIAL_VISIBLE_COUNT);
                            onSelectCategory(category.id);
                        }}
                    >
                        {category.title}
                    </button>
                ))}
            </div>

            <div className="map-sidebar__count">
                Найдено объектов: <strong>{places.length}</strong>
            </div>

            <div className="map-sidebar__list">
                {visiblePlaces.map((place) => (
                    <button
                        key={place.id}
                        className="map-place-card"
                        type="button"
                        onClick={() => onSelectPlace(place)}
                        onMouseEnter={() => onHoverPlace(place)}
                        onMouseLeave={() => onHoverPlace(null)}
                    >
                        <span className="map-place-card__category">
                            {place.categoryTitle}
                        </span>

                        <strong>{place.title}</strong>

                        <small>{place.shortDescription || place.description}</small>
                    </button>
                ))}
            </div>

            {hasMorePlaces && (
                <button
                    className="map-sidebar__load-more"
                    type="button"
                    onClick={() => setVisibleCount((count) => count + LOAD_MORE_STEP)}
                >
                    Показать еще
                </button>
            )}
        </aside>
    );
}