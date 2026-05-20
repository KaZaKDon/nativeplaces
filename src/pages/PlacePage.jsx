import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { places } from "../data/map/places";
import { createPlaceMapUrl } from "../entities/place/lib/createPlaceMapUrl";
import { getPlaceBySlug } from "../entities/place/lib/getPlaceBySlug";
import { getPlaceImages } from "../entities/place/lib/getPlaceImages";

import "./PlacePage.css";

export function PlacePage() {
    const { slug } = useParams();
    const place = getPlaceBySlug(places, slug);

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);

    const images = useMemo(() => getPlaceImages(place), [place]);

    const showPreviousImage = useCallback(() => {
        setActiveImageIndex((currentIndex) => {
            return currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        });
    }, [images.length]);

    const showNextImage = useCallback(() => {
        setActiveImageIndex((currentIndex) => {
            return currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        });
    }, [images.length]);

    useEffect(() => {
        if (!viewerOpen) {
            return undefined;
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setViewerOpen(false);
            }

            if (event.key === "ArrowLeft") {
                showPreviousImage();
            }

            if (event.key === "ArrowRight") {
                showNextImage();
            }
        }

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [viewerOpen, showPreviousImage, showNextImage]);

    function openViewer(index) {
        setActiveImageIndex(index);
        setViewerOpen(true);
    }

    if (!place) {
        return (
            <main className="place-page place-page--not-found">
                <section className="place-page__not-found">
                    <p className="place-page__eyebrow">Место не найдено</p>
                    <h1>Такого объекта пока нет</h1>
                    <p>Возможно, ссылка устарела или объект еще не добавлен в базу.</p>

                    <Link className="place-page__button" to="/map">
                        Вернуться к карте
                    </Link>
                </section>
            </main>
        );
    }

    const tags = [
        place.locality,
        place.area,
        place.landArea,
        ...(place.tags ?? []),
    ].filter(Boolean);

    return (
        <main className="place-page">
            <section className="place-hero">
                <div className="place-hero__image">
                    {images.length > 0 ? (
                        <>
                            <button
                                className="place-hero__image-button"
                                type="button"
                                onClick={() => openViewer(activeImageIndex)}
                            >
                                <img
                                    src={images[activeImageIndex]}
                                    alt={`${place.title} — фото ${activeImageIndex + 1}`}
                                />
                            </button>

                            {images.length > 1 && (
                                <>
                                    <button
                                        className="place-hero__arrow place-hero__arrow--prev"
                                        type="button"
                                        onClick={showPreviousImage}
                                        aria-label="Предыдущее фото"
                                    >
                                        ‹
                                    </button>

                                    <button
                                        className="place-hero__arrow place-hero__arrow--next"
                                        type="button"
                                        onClick={showNextImage}
                                        aria-label="Следующее фото"
                                    >
                                        ›
                                    </button>

                                    <div className="place-hero__counter">
                                        {activeImageIndex + 1} / {images.length}
                                    </div>

                                    <div className="place-hero__dots">
                                        {images.map((image, index) => (
                                            <button
                                                key={image}
                                                className={
                                                    index === activeImageIndex
                                                        ? "place-hero__dot is-active"
                                                        : "place-hero__dot"
                                                }
                                                type="button"
                                                onClick={() => setActiveImageIndex(index)}
                                                aria-label={`Фото ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="place-hero__placeholder">
                            Фото объекта
                        </div>
                    )}
                </div>

                <div className="place-hero__content">
                    <Link className="place-page__back" to={createPlaceMapUrl(place)}>
                        ← Вернуться к карте
                    </Link>

                    <p className="place-page__eyebrow">{place.categoryTitle}</p>

                    <h1>{place.title}</h1>

                    {place.price && <div className="place-page__price">{place.price}</div>}

                    <p className="place-hero__lead">
                        {place.fullDescription || place.description}
                    </p>

                    {tags.length > 0 && (
                        <div className="place-page__tags" aria-label="Метки объекта">
                            {tags.map((tag) => (
                                <span className="place-page__tag" key={tag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="place-page__actions">
                        <Link className="place-page__button" to={createPlaceMapUrl(place)}>
                            Открыть на карте
                        </Link>

                        <Link
                            className="place-page__button place-page__button--ghost"
                            to="/categories"
                        >
                            Все категории
                        </Link>
                    </div>
                </div>
            </section>

            {viewerOpen && images.length > 0 && (
                <div className="image-viewer" role="dialog" aria-modal="true">
                    <button
                        className="image-viewer__close"
                        type="button"
                        onClick={() => setViewerOpen(false)}
                        aria-label="Закрыть просмотр"
                    >
                        ×
                    </button>

                    {images.length > 1 && (
                        <button
                            className="image-viewer__arrow image-viewer__arrow--prev"
                            type="button"
                            onClick={showPreviousImage}
                            aria-label="Предыдущее фото"
                        >
                            ‹
                        </button>
                    )}

                    <img
                        className="image-viewer__image"
                        src={images[activeImageIndex]}
                        alt={`${place.title} — фото ${activeImageIndex + 1}`}
                    />

                    {images.length > 1 && (
                        <button
                            className="image-viewer__arrow image-viewer__arrow--next"
                            type="button"
                            onClick={showNextImage}
                            aria-label="Следующее фото"
                        >
                            ›
                        </button>
                    )}

                    <div className="image-viewer__counter">
                        {activeImageIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </main>
    );
}