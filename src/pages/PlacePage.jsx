import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { placesApi } from "../shared/api/placesApi";
import { createPlaceMapUrl } from "../entities/place/lib/createPlaceMapUrl";
import { createPlaceRouteUrl } from "../entities/place/lib/createPlaceRouteUrl";
import { getPlaceImages } from "../entities/place/lib/getPlaceImages";
import { saveMessage } from "../shared/storage/messagesStorage";
import { favoritesApi } from "../shared/api/favoritesApi";
import { AddToRouteModal } from "../features/routes/AddToRouteModal";

import "./PlacePage.css";

const PRIMARY_ATTRIBUTE_CODES = ["price", "area", "land_area", "rooms"];

function formatAttributeValue(attribute) {
    const value = attribute.value;

    if (!value) {
        return "";
    }

    if (attribute.code === "price") {
        const numberValue = Number(value);

        if (Number.isFinite(numberValue)) {
            return `${numberValue.toLocaleString("ru-RU")} ₽`;
        }

        return value;
    }

    if (attribute.code === "area") {
        return `${value} м²`;
    }

    if (attribute.code === "land_area") {
        return `${value} сот.`;
    }

    if (attribute.code === "rooms") {
        return `${value} комн.`;
    }

    return value;
}

function getPrimaryAttributes(place) {
    return (place.attributes ?? []).filter((attribute) =>
        PRIMARY_ATTRIBUTE_CODES.includes(attribute.code)
    );
}

function getSecondaryAttributes(place) {
    return (place.attributes ?? []).filter(
        (attribute) => !PRIMARY_ATTRIBUTE_CODES.includes(attribute.code)
    );
}

export function PlacePage() {
    const { slug } = useParams();

    const [place, setPlace] = useState(null);
    const [placeLoading, setPlaceLoading] = useState(true);
    const [placeError, setPlaceError] = useState("");

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [messageStatus, setMessageStatus] = useState("");
    const [favorite, setFavorite] = useState(false);
    const [routeModalOpen, setRouteModalOpen] = useState(false);

    const images = place ? getPlaceImages(place) : [];

    useEffect(() => {
        let isMounted = true;

        async function loadPlace() {
            try {
                const data = await placesApi.getPlaceBySlug(slug);

                if (!isMounted) {
                    return;
                }

                if (!data.place) {
                    setPlace(null);
                    setPlaceError("Объект не найден.");
                    return;
                }

                setPlace(data.place);

                try {
                    const favoriteData = await favoritesApi.checkFavorite(
                        data.place.id
                    );

                    setFavorite(Boolean(favoriteData.is_favorite));
                } catch (error) {
                    console.error("Не удалось проверить избранное:", error);
                    setFavorite(false);
                }

                setPlaceError("");
                setActiveImageIndex(0);
            } catch (error) {
                console.error("Не удалось загрузить объект:", error);

                if (isMounted) {
                    setPlace(null);
                    setPlaceError(
                        error.message || "Не удалось загрузить объект."
                    );
                }
            } finally {
                if (isMounted) {
                    setPlaceLoading(false);
                }
            }
        }

        loadPlace();

        return () => {
            isMounted = false;
        };
    }, [slug]);

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

    const primaryAttributes = useMemo(() => {
        return place ? getPrimaryAttributes(place) : [];
    }, [place]);

    const secondaryAttributes = useMemo(() => {
        return place ? getSecondaryAttributes(place) : [];
    }, [place]);

    function openViewer(index) {
        setActiveImageIndex(index);
        setViewerOpen(true);
    }

    async function handleToggleFavorite() {
        if (!place) {
            return;
        }

        try {
            const result = await favoritesApi.toggleFavorite(place.id);

            setFavorite(Boolean(result.is_favorite));
        } catch (error) {
            console.error(error);

            window.alert(error.message || "Не удалось изменить избранное.");
        }
    }

    function handleSendMessage() {
        if (!place) {
            return;
        }

        const text = messageText.trim();

        if (!text) {
            setMessageStatus("Введите текст сообщения.");
            return;
        }

        saveMessage({
            placeId: place.id,
            placeSlug: place.slug,
            placeTitle: place.title,
            placeImage: place.image,
            placeCategoryTitle: place.categoryTitle,
            text,
        });

        setMessageText("");
        setMessageStatus("Сообщение сохранено в кабинете.");

        setTimeout(() => {
            setMessageModalOpen(false);
            setMessageStatus("");
        }, 1000);
    }

    if (placeLoading) {
        return (
            <main className="place-page place-page--not-found">
                <section className="place-page__not-found">
                    <p className="place-page__eyebrow">Загрузка</p>
                    <h1>Загружаем объект</h1>
                    <p>Получаем данные из базы.</p>
                </section>
            </main>
        );
    }

    if (!place) {
        return (
            <main className="place-page place-page--not-found">
                <section className="place-page__not-found">
                    <p className="place-page__eyebrow">Место не найдено</p>
                    <h1>Такого объекта пока нет</h1>
                    <p>
                        {placeError ||
                            "Возможно, ссылка устарела или объект еще не добавлен в базу."}
                    </p>

                    <Link className="place-page__button" to="/map">
                        Вернуться к карте
                    </Link>
                </section>
            </main>
        );
    }

    const tags = Array.from(
        new Set(
            [place.locality, place.typeTitle, place.categoryTitle].filter(
                Boolean
            )
        )
    );

    const routeUrl = createPlaceRouteUrl(place);

    return (
        <main className="place-page">
            <section className="place-hero">
                <div className="place-hero__image">
                    {images.length > 0 ? (
                        <div className="place-hero__gallery">
                            <div className="place-hero__main">
                                <button
                                    className="place-hero__image-button"
                                    type="button"
                                    onClick={() => openViewer(activeImageIndex)}
                                >
                                    <img
                                        src={images[activeImageIndex]}
                                        alt={`${place.title} — фото ${
                                            activeImageIndex + 1
                                        }`}
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
                                            {activeImageIndex + 1} /{" "}
                                            {images.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div
                                    className="place-hero__thumbs"
                                    aria-label="Фотографии объекта"
                                >
                                    {images.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            className={
                                                index === activeImageIndex
                                                    ? "place-hero__thumb is-active"
                                                    : "place-hero__thumb"
                                            }
                                            type="button"
                                            onClick={() =>
                                                setActiveImageIndex(index)
                                            }
                                            aria-label={`Показать фото ${
                                                index + 1
                                            }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${place.title} — миниатюра ${
                                                    index + 1
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="place-hero__placeholder">
                            Фото объекта
                        </div>
                    )}
                </div>

                <div className="place-hero__content">
                    <div className="place-page__topbar">
                        <Link
                            className="place-page__back"
                            to={createPlaceMapUrl(place)}
                        >
                            ← Вернуться к карте
                        </Link>

                        <button
                            className="place-page__message-button"
                            type="button"
                            onClick={() => setMessageModalOpen(true)}
                        >
                            Сообщение автору
                        </button>
                    </div>

                    <p className="place-page__eyebrow">
                        {place.categoryTitle}
                    </p>

                    <h1>{place.title}</h1>

                    {primaryAttributes.length > 0 && (
                        <div className="place-page__summary">
                            {primaryAttributes.map((attribute) => (
                                <span
                                    className="place-page__summary-item"
                                    key={attribute.id || attribute.code}
                                >
                                    {formatAttributeValue(attribute)}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="place-hero__lead">
                        {place.fullDescription || place.description}
                    </p>

                    {secondaryAttributes.length > 0 && (
                        <section className="place-page__attributes">
                            <h2>Характеристики объекта</h2>

                            <div className="place-page__attributes-scroll">
                                <dl>
                                    {secondaryAttributes.map((attribute) => (
                                        <div
                                            className="place-page__attribute-row"
                                            key={attribute.id || attribute.code}
                                        >
                                            <dt>{attribute.title}</dt>
                                            <dd>
                                                {formatAttributeValue(
                                                    attribute
                                                )}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </section>
                    )}

                    {tags.length > 0 && (
                        <div
                            className="place-page__tags"
                            aria-label="Метки объекта"
                        >
                            {tags.map((tag) => (
                                <span className="place-page__tag" key={tag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="place-page__actions">
                        <button
                            className={
                                favorite
                                    ? "place-page__favorite place-page__favorite--active"
                                    : "place-page__favorite"
                            }
                            type="button"
                            onClick={handleToggleFavorite}
                        >
                            {favorite ? "В избранном" : "В избранное"}
                        </button>

                        <Link
                            className="place-page__button"
                            to={createPlaceMapUrl(place)}
                        >
                            Открыть на карте
                        </Link>

                        {routeUrl && (
                            <a
                                className="place-page__button place-page__button--route"
                                href={routeUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Построить маршрут
                            </a>
                        )}

                        <Link
                            className="place-page__button place-page__button--ghost"
                            to="/categories"
                        >
                            Все категории
                        </Link>
                    </div>

                    <div className="place-page__route-add">
                        <button
                            className="place-page__button place-page__button--add-route"
                            type="button"
                            onClick={() => setRouteModalOpen(true)}
                        >
                            Добавить в маршрут
                        </button>
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

            {messageModalOpen && (
                <div className="message-modal" role="dialog" aria-modal="true">
                    <div className="message-modal__card">
                        <button
                            className="message-modal__close"
                            type="button"
                            onClick={() => setMessageModalOpen(false)}
                            aria-label="Закрыть окно"
                        >
                            ×
                        </button>

                        <p className="place-page__eyebrow">
                            Сообщение автору
                        </p>

                        <h2>{place.title}</h2>

                        <div className="message-chat">
                            <div className="message-chat__row message-chat__row--author">
                                <div className="message-chat__avatar">А</div>

                                <div className="message-chat__bubble">
                                    <strong>Автор объявления</strong>
                                    <p>Задайте вопрос по этому объекту.</p>
                                </div>
                            </div>

                            <div className="message-chat__row message-chat__row--user">
                                <div className="message-chat__bubble message-chat__bubble--input">
                                    <strong>Вы</strong>

                                    <textarea
                                        rows="5"
                                        value={messageText}
                                        placeholder="Здравствуйте! Подскажите, объявление актуально?"
                                        onChange={(event) => {
                                            setMessageText(event.target.value);
                                            setMessageStatus("");
                                        }}
                                    />

                                    {messageStatus && (
                                        <p className="message-modal__status">
                                            {messageStatus}
                                        </p>
                                    )}
                                </div>

                                <div className="message-chat__avatar message-chat__avatar--user">
                                    Я
                                </div>
                            </div>
                        </div>

                        <button
                            className="place-page__button message-modal__submit"
                            type="button"
                            onClick={handleSendMessage}
                        >
                            Отправить
                        </button>
                    </div>
                </div>
            )}

            {routeModalOpen && (
                <AddToRouteModal
                    place={place}
                    onClose={() => setRouteModalOpen(false)}
                />
            )}
        </main>
    );
}