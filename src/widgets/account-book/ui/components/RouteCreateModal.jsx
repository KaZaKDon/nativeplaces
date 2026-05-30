import { useMemo, useState } from "react";

import { places } from "../../../../data/map/places";
import { getLocalPlaces } from "../../../../shared/storage/localPlacesStorage";

import "./RouteCreateModal.css";

const initialForm = {
    title: "",
    description: "",
};

export function RouteCreateModal({ onClose, onCreate }) {
    const [form, setForm] = useState(initialForm);
    const [selectedPlaceId, setSelectedPlaceId] = useState("");
    const [routePlaces, setRoutePlaces] = useState([]);

    const allPlaces = useMemo(() => {
        return [...places, ...getLocalPlaces()];
    }, []);

    const availablePlaces = allPlaces.filter((place) => {
        return !routePlaces.some((routePlace) => String(routePlace.id) === String(place.id));
    });

    function handleFormChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function handleAddPlace() {
        const place = allPlaces.find((item) => String(item.id) === String(selectedPlaceId));

        if (!place) {
            return;
        }

        setRoutePlaces((currentPlaces) => [
            ...currentPlaces,
            {
                id: place.id,
                title: place.title,
                slug: place.slug,
                position: place.position,
                categoryTitle: place.categoryTitle,
            },
        ]);

        setSelectedPlaceId("");
    }

    function handleRemovePlace(placeId) {
        setRoutePlaces((currentPlaces) => {
            return currentPlaces.filter((place) => String(place.id) !== String(placeId));
        });
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!form.title.trim() || routePlaces.length === 0) {
            return;
        }

        onCreate({
            title: form.title.trim(),
            description: form.description.trim(),
            places: routePlaces,
        });

        setForm(initialForm);
        setSelectedPlaceId("");
        setRoutePlaces([]);
    }

    return (
        <div className="route-create-modal" role="dialog" aria-modal="true">
            <div className="route-create-modal__card">
                <button
                    className="route-create-modal__close"
                    type="button"
                    onClick={onClose}
                    aria-label="Закрыть окно"
                >
                    ×
                </button>

                <h2>Создать маршрут</h2>

                <form className="route-create-form" onSubmit={handleSubmit}>
                    <label>
                        <span>Название маршрута</span>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            placeholder="Например, Рыбалка у Дона"
                            onChange={handleFormChange}
                        />
                    </label>

                    <label>
                        <span>Выберите место</span>
                        <select
                            value={selectedPlaceId}
                            onChange={(event) => setSelectedPlaceId(event.target.value)}
                        >
                            <option value="">Выберите первое место</option>

                            {availablePlaces.map((place) => (
                                <option key={place.id} value={place.id}>
                                    {place.title}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        className="route-create-form__add"
                        type="button"
                        onClick={handleAddPlace}
                        disabled={!selectedPlaceId}
                    >
                        + Добавить место
                    </button>

                    {routePlaces.length > 0 && (
                        <div className="route-create-form__places">
                            {routePlaces.map((place, index) => (
                                <div className="route-create-form__place" key={place.id}>
                                    <span>{index + 1}. {place.title}</span>

                                    <button
                                        type="button"
                                        onClick={() => handleRemovePlace(place.id)}
                                    >
                                        Убрать
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label>
                        <span>Описание</span>
                        <textarea
                            name="description"
                            rows="4"
                            value={form.description}
                            placeholder="Кратко опишите маршрут"
                            onChange={handleFormChange}
                        />
                    </label>

                    <button
                        className="route-create-form__submit"
                        type="submit"
                        disabled={!form.title.trim() || routePlaces.length === 0}
                    >
                        Создать маршрут
                    </button>
                </form>
            </div>
        </div>
    );
}