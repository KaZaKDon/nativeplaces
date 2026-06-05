import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { getFieldsByCategory } from "../data/submit/categoryFields";
import { myPlacesApi } from "../shared/api/myPlacesApi";
import { submitOptionsApi } from "../shared/api/submitOptionsApi";
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

function getContactFields(contactValue) {
    const value = contactValue.trim();

    if (!value) {
        return {
            phone: "",
            telegram: "",
            email: "",
        };
    }

    if (value.includes("@") && !value.startsWith("@")) {
        return {
            phone: "",
            telegram: "",
            email: value,
        };
    }

    if (value.startsWith("@") || value.toLowerCase().includes("t.me")) {
        return {
            phone: "",
            telegram: value,
            email: "",
        };
    }

    return {
        phone: value,
        telegram: "",
        email: "",
    };
}

export function SubmitPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editPlaceId = searchParams.get("edit");
    const editingPlace = null;
    const initialDraft = editPlaceId ? null : getSubmitDraft();

    const isEditMode = Boolean(editPlaceId && editingPlace);

    const [submitCategories, setSubmitCategories] = useState([]);
    const [submitTypes, setSubmitTypes] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [optionsError, setOptionsError] = useState("");

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [submitLocation] = useState(() => {
        return getSubmitLocation();
    });

    useEffect(() => {
        let isMounted = true;

        async function loadOptions() {
            try {
                const data = await submitOptionsApi.getCreateOptions();

                if (!isMounted) {
                    return;
                }

                setSubmitCategories(Array.isArray(data.categories) ? data.categories : []);
                setSubmitTypes(Array.isArray(data.types) ? data.types : []);
                setOptionsError("");
            } catch (error) {
                console.error("Не удалось загрузить справочники формы:", error);

                if (isMounted) {
                    setOptionsError(
                        error.message || "Не удалось загрузить категории и типы объектов."
                    );
                }
            } finally {
                if (isMounted) {
                    setOptionsLoading(false);
                }
            }
        }

        loadOptions();

        return () => {
            isMounted = false;
        };
    }, []);

    const dynamicFields = useMemo(() => {
        return getFieldsByCategory(selectedCategory);
    }, [selectedCategory]);

    const categoryTypes = useMemo(() => {
        if (!selectedCategory) {
            return [];
        }

        return submitTypes.filter((type) => {
            return type.category_code === selectedCategory;
        });
    }, [selectedCategory, submitTypes]);

    const selectedCategoryItem = useMemo(() => {
        return submitCategories.find((category) => {
            return category.code === selectedCategory;
        });
    }, [selectedCategory, submitCategories]);

    const selectedTypeItem = useMemo(() => {
        return submitTypes.find((type) => {
            return type.code === selectedType;
        });
    }, [selectedType, submitTypes]);

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

    function handleSelectCategory(categoryCode) {
        setSelectedCategory(categoryCode);
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

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (!formData.title.trim()) {
            setSubmitStatus("Укажите название объекта.");
            return;
        }

        if (!selectedCategoryItem) {
            setSubmitStatus("Выберите категорию.");
            return;
        }

        if (!selectedTypeItem) {
            setSubmitStatus("Выберите тип объекта.");
            return;
        }

        if (!submitLocation && !editingPlace?.position) {
            setSubmitStatus("Укажите точку на карте.");
            return;
        }

        const position = submitLocation
            ? [submitLocation.lat, submitLocation.lng]
            : editingPlace.position;

        const contactFields = getContactFields(formData.contactValue);

        setIsSubmitting(true);
        setSubmitStatus("Сохраняем объект...");

        try {
            const createdPlace = await myPlacesApi.createMyPlace({
                title: formData.title.trim(),
                categoryId: selectedCategoryItem.id,
                placeTypeId: selectedTypeItem.id,
            });

            await myPlacesApi.updateMyPlace({
                id: createdPlace.place_id,
                title: formData.title.trim(),
                shortDescription: formData.shortDescription.trim(),
                fullDescription: formData.fullDescription.trim(),
                address: formData.address.trim(),
                latitude: position[0],
                longitude: position[1],
                contactName: formData.contactName.trim(),
                phone: contactFields.phone,
                telegram: contactFields.telegram,
                email: contactFields.email,
                website: "",
                bookingType: "phone",
                bookingUrl: "",
            });

            clearSubmitDraft();
            clearSubmitLocation();

            setSubmitStatus("Объект отправлен на модерацию.");
            navigate("/account");
        } catch (error) {
            console.error(error);
            setSubmitStatus(error.message || "Не удалось сохранить объект.");
        } finally {
            setIsSubmitting(false);
        }
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

                        <h1>Редактирование пока не подключено</h1>

                        <p className="submit-hero__lead">
                            Сейчас форма подключается к backend для создания новых объектов.
                            Редактирование существующих объектов подключим отдельным шагом.
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
                            ? "Изменения сохранятся в базе данных."
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
                                            selectedCategory === category.code
                                                ? "submit-category is-active"
                                                : "submit-category"
                                        }
                                        type="button"
                                        onClick={() => handleSelectCategory(category.code)}
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
                                                selectedType === type.code
                                                    ? "submit-type is-active"
                                                    : "submit-type"
                                            }
                                            type="button"
                                            onClick={() => setSelectedType(type.code)}
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
                            Фотографии пока показываются как предварительный просмотр.
                            Загрузку фото на сервер подключим отдельным шагом.
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

                    {optionsLoading && (
                        <div className="submit-form__status">
                            Загружаем категории...
                        </div>
                    )}

                    {optionsError && (
                        <div className="submit-form__status">
                            {optionsError}
                        </div>
                    )}

                    {submitStatus && (
                        <div className="submit-form__status">
                            {submitStatus}
                        </div>
                    )}

                    <button
                        className="submit-form__submit"
                        type="submit"
                        disabled={isSubmitting || optionsLoading}
                    >
                        {isSubmitting
                            ? "Сохраняем..."
                            : isEditMode
                                ? "Сохранить изменения"
                                : "Отправить на модерацию"}
                    </button>
                </form>
            </section>
        </main>
    );
}