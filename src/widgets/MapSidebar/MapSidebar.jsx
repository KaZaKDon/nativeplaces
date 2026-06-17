import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { mapCategories } from "../../shared/config/categoryConfig";

import "./MapSidebar.css";

const INITIAL_VISIBLE_COUNT = 15;
const LOAD_MORE_STEP = 15;

export function MapSidebar({
    places = [],
    selectedPlace,
    hoveredPlace,
    activeCategory = "all",
    search = "",
    isMobileSheet = false,
    onSelectCategory,
    onSelectPlace,
    onClearSelected,
    onSearchChange,
    onHoverPlace,
}) {
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const visiblePlaces = useMemo(() => {
        return places.slice(0, visibleCount);
    }, [places, visibleCount]);

    const hasMorePlaces = visibleCount < places.length;

    function handleSearchChange(event) {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
        onSearchChange(event.target.value);
    }

    function handleCategorySelect(categoryId) {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
        setFiltersOpen(false);
        onSelectCategory(categoryId);
    }

    if (selectedPlace) {
        const tags = [
            selectedPlace.locality,
            selectedPlace.area,
            selectedPlace.landArea,
            ...(selectedPlace.tags ?? []),
        ].filter(Boolean);

        return (
            <aside className={isMobileSheet ? "map-sidebar map-sidebar--sheet" : "map-sidebar"}>
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

                    {tags.length > 0 && (
                        <div className="place-panel__tags">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    className="place-panel__tag"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}

                    <Link
                        className="place-panel__button"
                        to={`/place/${selectedPlace.slug}`}
                    >
                        Подробнее
                    </Link>
                </article>
            </aside>
        );
    }

    return (
        <aside className={isMobileSheet ? "map-sidebar map-sidebar--sheet" : "map-sidebar"}>
            <div className="map-sidebar__top">
                <Link className="map-sidebar__home" to="/">
                    ← На главную
                </Link>

                <Link className="map-sidebar__add-place" to="/submit">
                    + Добавить место
                </Link>

                <button
                    className="map-sidebar__filter-toggle"
                    type="button"
                    onClick={() => setFiltersOpen((value) => !value)}
                    aria-label="Открыть категории"
                    aria-expanded={filtersOpen}
                >
                    ☰
                </button>
            </div>

            <div className="map-sidebar__head">
                <h1>Исследуйте территорию</h1>
            </div>

            <label className="map-sidebar__search">
                <span>Поиск по карте</span>
                <input
                    type="search"
                    value={search}
                    placeholder="Название, район, описание..."
                    onChange={handleSearchChange}
                />
            </label>

            {filtersOpen && (
                <div className="map-sidebar__filters">
                    {mapCategories.map((category) => (
                        <button
                            key={category.id}
                            className={
                                activeCategory === category.id
                                    ? "map-sidebar__filter is-active"
                                    : "map-sidebar__filter"
                            }
                            type="button"
                            onClick={() => handleCategorySelect(category.id)}
                        >
                            {category.title}
                        </button>
                    ))}
                </div>
            )}

            <div className="map-sidebar__count">
                Найдено объектов: <strong>{places.length}</strong>
            </div>

            <div className="map-sidebar__list">
                {visiblePlaces.map((place) => {
                    const isHovered = hoveredPlace?.id === place.id;

                    return (
                        <button
                            key={place.id}
                            className={isHovered ? "map-place-card is-hovered" : "map-place-card"}
                            type="button"
                            onClick={() => onSelectPlace(place)}
                            onMouseEnter={() => onHoverPlace?.(place)}
                            onMouseLeave={() => onHoverPlace?.(null)}
                        >
                            <span className="map-place-card__category">{place.categoryTitle}</span>
                            <strong>{place.title}</strong>
                            <small>{place.shortDescription || place.description}</small>
                        </button>
                    );
                })}
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