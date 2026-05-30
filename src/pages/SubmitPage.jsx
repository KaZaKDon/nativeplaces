import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
    getFieldsByCategory,
    getTypesByCategory,
    submitCategories,
} from "../data/submit/categoryFields";
import {
    getLocalPlaceById,
    saveLocalPlace,
    updateLocalPlace,
} from "../shared/storage/localPlacesStorage";
import {
    clearSubmitDraft,
    getSubmitDraft,
    saveSubmitDraft,
} from "../shared/storage/submitDraftStorage";
import {
    clearSubmitLocation,
    getSubmitLocation,
} from "../shared/storage/submitLocationStorage";

import "./SubmitPage.css";

function createSlug(value) {
    const baseSlug = value
        .trim()
        .toLowerCase()
        .replaceAll("ё", "е")
        .replace(/[^a-zа-я0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "");

    return `${baseSlug || "place"}-${Date.now()}`;
}

function createLocalId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `local-${Date.now()}`;
}

function getCategoryTitle(categoryId) {
    return submitCategories.find((category) => category.id === categoryId)?.title ?? "";
}

function getFormDataFromPlace(place) {
    return {
        title: place?.title ?? "",
        shortDescription: place?.shortDescription ?? place?.description ?? "",
        fullDescription: place?.fullDescription ?? "",
        address: place?.address ?? place?.locality ?? "",
        contactName: place?.contact?.name ?? "",
        contactValue: place?.contact?.value ?? "",
    };
}

function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(String(reader.result));
        };

        reader.readAsDataURL(file);
    });
}

export function SubmitPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editPlaceId = searchParams.get("edit");
    const editingPlace = editPlaceId ? getLocalPlaceById(editPlaceId) : null;
    const initialDraft = editPlaceId ? null : getSubmitDraft();

    const isEditMode = Boolean(editPlaceId && editingPlace);

    const [selectedCategory, setSelectedCategory] = useState(() => {
        return initialDraft?.selectedCategory ?? editingPlace?.categorySlug ?? "";
    });

    const [selectedType, setSelectedType] = useState(() => {
        return initialDraft?.selectedType ?? editingPlace?.typeSlug ?? "";
    });

    const [formData, setFormData] = useState(() => {
        return initialDraft?.formData ?? getFormDataFromPlace(editingPlace);
    });

    const [extraFields, setExtraFields] = useState(() => {
        return initialDraft?.extraFields ?? editingPlace?.extraFields ?? {};
    });

    const [gallery, setGallery] = useState(() => {
        if (initialDraft?.gallery?.length) {
            return initialDraft.gallery;
        }

        if (editingPlace?.gallery?.length) {
            return editingPlace.gallery;
        }

        if (editingPlace?.image) {
            return [editingPlace.image];
        }

        return [];
    });

    const [submitStatus, setSubmitStatus] = useState("");

    const [submitLocation] = useState(() => {
        return getSubmitLocation();
    });

    const dynamicFields = useMemo(() => {
        return getFieldsByCategory(selectedCategory);
    }, [selectedCategory]);

    const categoryTypes = useMemo(() => {
        return getTypesByCategory(selectedCategory);
    }, [selectedCategory]);

    function getCurrentDraft() {
        return {
            selectedCategory,
            selectedType,
            formData,
            extraFields,
            gallery,
            updatedAt: new Date().toISOString(),
        };
    }

    function handleSaveDraftBeforeLocation() {
        if (isEditMode) {
            return;
        }

        saveSubmitDraft(getCurrentDraft());
    }

    function handleSelectCategory(categoryId) {
        setSelectedCategory(categoryId);
        setSelectedType("");
        setExtraFields({});
        setSubmitStatus("");
    }

    function handleFormChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));

        setSubmitStatus("");
    }

    function handleExtraFieldChange(event) {
        const { name, value } = event.target;

        setExtraFields((currentFields) => ({
            ...currentFields,
            [name]: value,
        }));

        setSubmitStatus("");
    }

    async function handleImagesChange(event) {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) {
            return;
        }

        const images = await Promise.all(files.map(readFileAsDataUrl));

        setGallery((currentGallery) => [...currentGallery, ...images]);
        setSubmitStatus("");
    }

    function handleRemoveImage(indexToRemove) {
        setGallery((currentGallery) => {
            return currentGallery.filter((_, index) => index !== indexToRemove);
        });
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!formData.title.trim()) {
            setSubmitStatus("Укажите название объекта.");
            return;
        }

        if (!selectedCategory) {
            setSubmitStatus("Выберите категорию.");
            return;
        }

        if (!submitLocation && !editingPlace?.position) {
            setSubmitStatus("Укажите точку на карте.");
            return;
        }

        const categoryTitle = getCategoryTitle(selectedCategory);
        const position = submitLocation
            ? [submitLocation.lat, submitLocation.lng]
            : editingPlace.position;

        const placePayload = {
            slug: editingPlace?.slug ?? createSlug(formData.title),

            title: formData.title.trim(),

            categorySlug: selectedCategory,
            categoryTitle,

            typeSlug: selectedType,

            shortDescription: formData.shortDescription.trim(),
            description: formData.shortDescription.trim(),
            fullDescription: formData.fullDescription.trim(),

            locality: formData.address.trim(),
            address: formData.address.trim(),

            tags: [
                categoryTitle,
                selectedType,
                formData.address.trim(),
            ].filter(Boolean),

            position,

            image: gallery[0] ?? "",
            gallery,

            contact: {
                name: formData.contactName.trim(),
                value: formData.contactValue.trim(),
            },

            extraFields,

            source: "local",
            status: editingPlace?.status ?? "draft",
        };

        if (isEditMode) {
            updateLocalPlace(editPlaceId, placePayload);
            navigate(`/map?category=${selectedCategory}&place=${editPlaceId}`);
            return;
        }

        const newPlace = {
            id: createLocalId(),
            ...placePayload,
            createdAt: new Date().toISOString(),
        };

        saveLocalPlace(newPlace);
        clearSubmitDraft();
        clearSubmitLocation();
        navigate(`/map?category=${selectedCategory}&place=${newPlace.id}`);
    }

    if (editPlaceId && !editingPlace) {
        return (
            <main className="submit-page">
                <section className="submit-hero">
                    <div className="submit-hero__content">
                        <Link className="submit-page__back" to="/account">
                            ← В кабинет
                        </Link>

                        <p className="submit-page__eyebrow">Редактирование</p>

                        <h1>Объект не найден</h1>

                        <p className="submit-hero__lead">
                            Возможно, он был удалён из локального хранилища браузера.
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="submit-page">
            <section className="submit-hero">
                <div className="submit-hero__content">
                    <Link className="submit-page__back" to={isEditMode ? "/account" : "/categories"}>
                        {isEditMode ? "← В кабинет" : "← Назад к категориям"}
                    </Link>

                    <p className="submit-page__eyebrow">
                        {isEditMode ? "Редактировать место" : "Добавить место"}
                    </p>

                    <h1>
                        {isEditMode
                            ? "Обновите информацию об объекте"
                            : "Расскажите о месте, объекте или объявлении"}
                    </h1>

                    <p className="submit-hero__lead">
                        {isEditMode
                            ? "Изменения сохранятся локально в этом браузере."
                            : "Добавьте точку на карту: природное место, рыбалку, охоту, базу отдыха, аренду или недвижимость."}
                    </p>
                </div>

                <form className="submit-form" onSubmit={handleSubmit}>
                    <section className="submit-form__section">
                        <h2>Основная информация</h2>

                        <label className="submit-form__field">
                            <span>Название</span>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                placeholder="Например, Дом в Вёшенской"
                                onChange={handleFormChange}
                            />
                        </label>

                        <div className="submit-form__field">
                            <span>Категория</span>

                            <div className="submit-category-grid">
                                {submitCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        className={
                                            selectedCategory === category.id
                                                ? "submit-category is-active"
                                                : "submit-category"
                                        }
                                        type="button"
                                        onClick={() => handleSelectCategory(category.id)}
                                    >
                                        {category.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {categoryTypes.length > 0 && (
                            <div className="submit-form__field">
                                <span>Тип объекта</span>

                                <div className="submit-type-grid">
                                    {categoryTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            className={
                                                selectedType === type.id
                                                    ? "submit-type is-active"
                                                    : "submit-type"
                                            }
                                            type="button"
                                            onClick={() => setSelectedType(type.id)}
                                        >
                                            {type.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <label className="submit-form__field">
                            <span>Краткое описание</span>
                            <textarea
                                rows="3"
                                name="shortDescription"
                                value={formData.shortDescription}
                                placeholder="Коротко: что это за место и чем оно интересно"
                                onChange={handleFormChange}
                            />
                        </label>

                        <label className="submit-form__field">
                            <span>Полное описание</span>
                            <textarea
                                rows="5"
                                name="fullDescription"
                                value={formData.fullDescription}
                                placeholder="Расскажите подробнее"
                                onChange={handleFormChange}
                            />
                        </label>
                    </section>

                    {dynamicFields.length > 0 && (
                        <section className="submit-form__section">
                            <h2>Детали категории</h2>

                            <div className="submit-form__grid">
                                {dynamicFields.map((field) => (
                                    <label className="submit-form__field" key={field.name}>
                                        <span>{field.label}</span>
                                        <input
                                            type="text"
                                            name={field.name}
                                            value={extraFields[field.name] ?? ""}
                                            placeholder={field.placeholder}
                                            onChange={handleExtraFieldChange}
                                        />
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="submit-form__section">
                        <h2>Локация и фото</h2>

                        <label className="submit-form__field">
                            <span>Адрес или ориентир</span>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                placeholder="Например, Ростовская область, станица Вёшенская"
                                onChange={handleFormChange}
                            />
                        </label>

                        <div className="submit-location-box">
                            <div>
                                <span>Точка на карте</span>

                                {submitLocation ? (
                                    <strong>
                                        {submitLocation.lat}, {submitLocation.lng}
                                    </strong>
                                ) : editingPlace?.position ? (
                                    <strong>
                                        {editingPlace.position[0]}, {editingPlace.position[1]}
                                    </strong>
                                ) : (
                                    <strong>Точка пока не выбрана</strong>
                                )}
                            </div>

                            <Link
                                className="submit-location-box__button"
                                to="/submit/location"
                                onClick={handleSaveDraftBeforeLocation}
                            >
                                {submitLocation || editingPlace?.position
                                    ? "Изменить точку"
                                    : "Указать на карте"}
                            </Link>
                        </div>

                        <label className="submit-form__field">
                            <span>Фотографии</span>

                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImagesChange}
                            />
                        </label>

                        {gallery.length > 0 && (
                            <div className="submit-gallery-preview">
                                {gallery.map((image, index) => (
                                    <div className="submit-gallery-preview__item" key={`${image}-${index}`}>
                                        <img src={image} alt={`Фото ${index + 1}`} />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="submit-form__note">
                            В демо-режиме фотографии сохраняются локально в браузере.
                        </p>
                    </section>

                    <section className="submit-form__section">
                        <h2>Контакт для связи</h2>

                        <label className="submit-form__field">
                            <span>Имя</span>
                            <input
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                placeholder="Как к вам обращаться"
                                onChange={handleFormChange}
                            />
                        </label>

                        <label className="submit-form__field">
                            <span>Телефон или email</span>
                            <input
                                type="text"
                                name="contactValue"
                                value={formData.contactValue}
                                placeholder="Этот контакт не будет показан публично"
                                onChange={handleFormChange}
                            />
                        </label>
                    </section>

                    {submitStatus && (
                        <div className="submit-form__status">
                            {submitStatus}
                        </div>
                    )}

                    <button className="submit-form__submit" type="submit">
                        {isEditMode ? "Сохранить изменения" : "Отправить на модерацию"}
                    </button>
                </form>
            </section>
        </main>
    );
}