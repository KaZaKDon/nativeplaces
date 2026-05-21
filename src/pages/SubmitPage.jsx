import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    getFieldsByCategory,
    getTypesByCategory,
    submitCategories,
} from "../data/submit/categoryFields";
import { getSubmitLocation } from "../shared/storage/submitLocationStorage";
import { saveLocalPlace } from "../shared/storage/localPlacesStorage";

import "./SubmitPage.css";

const INITIAL_FORM_DATA = {
    title: "",
    shortDescription: "",
    fullDescription: "",
    address: "",
    contactName: "",
    contactValue: "",
};

function createSlug(value) {
    const baseSlug = value
        .trim()
        .toLowerCase()
        .replaceAll("ё", "е")
        .replace(/[^a-zа-я0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "");

    const suffix = Date.now();

    return `${baseSlug || "place"}-${suffix}`;
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

export function SubmitPage() {
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [extraFields, setExtraFields] = useState({});
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
    }

    function handleExtraFieldChange(event) {
        const { name, value } = event.target;

        setExtraFields((currentFields) => ({
            ...currentFields,
            [name]: value,
        }));
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

        if (!submitLocation) {
            setSubmitStatus("Укажите точку на карте.");
            return;
        }

        const categoryTitle = getCategoryTitle(selectedCategory);

        const newPlace = {
            id: createLocalId(),
            slug: createSlug(formData.title),

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

            position: [submitLocation.lat, submitLocation.lng],

            image: "",
            gallery: [],

            contact: {
                name: formData.contactName.trim(),
                value: formData.contactValue.trim(),
            },

            extraFields,

            source: "local",
            status: "draft",
            createdAt: new Date().toISOString(),
        };

        saveLocalPlace(newPlace);

        setSubmitStatus("Объект сохранён локально. Он появится на карте в этом браузере.");

        navigate(`/map?category=${selectedCategory}&place=${newPlace.id}`);
    }

    return (
        <main className="submit-page">
            <section className="submit-hero">
                <div className="submit-hero__content">
                    <Link className="submit-page__back" to="/categories">
                        ← Назад к категориям
                    </Link>

                    <p className="submit-page__eyebrow">Добавить место</p>

                    <h1>Расскажите о месте, объекте или объявлении</h1>

                    <p className="submit-hero__lead">
                        Добавьте точку на карту: природное место, рыбалку, охоту,
                        базу отдыха, аренду или недвижимость. После проверки объект
                        сможет появиться на платформе.
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
                                placeholder="Расскажите подробнее: особенности, условия, расположение, важные детали"
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
                                ) : (
                                    <strong>Точка пока не выбрана</strong>
                                )}
                            </div>

                            <Link
                                className="submit-location-box__button"
                                to="/submit/location"
                            >
                                Указать на карте
                            </Link>
                        </div>

                        <label className="submit-form__field">
                            <span>Фотографии</span>
                            <input type="file" multiple accept="image/*" />
                        </label>

                        <p className="submit-form__note">
                            В демо-режиме фотографии пока не сохраняются. После подключения
                            backend загрузку фото обработаем через сервер.
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

                        <p className="submit-form__note">
                            В будущем вопросы по объявлению будут приходить в личный кабинет.
                            Телефон автора публично показывать не обязательно.
                        </p>
                    </section>

                    {submitStatus && (
                        <div className="submit-form__status">
                            {submitStatus}
                        </div>
                    )}

                    <button className="submit-form__submit" type="submit">
                        Отправить на модерацию
                    </button>
                </form>
            </section>
        </main>
    );
}