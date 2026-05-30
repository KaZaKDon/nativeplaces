import { useState } from "react";

import {
    getAccountProfile,
    saveAccountProfile,
} from "../../../../shared/storage/accountProfileStorage";
import {
    deleteSupportRequest,
    getSupportRequests,
    saveSupportRequest,
    supportTypeTitles,
} from "../../../../shared/storage/supportStorage";

import "./AccountSettingsSection.css";

function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(String(reader.result));
        };

        reader.readAsDataURL(file);
    });
}

export function AccountSettingsSection({ onProfileUpdate }) {
    const [view, setView] = useState("settings");

    const [profile, setProfile] = useState(() => getAccountProfile());

    const [contactOpen, setContactOpen] = useState(false);
    const [contactType, setContactType] = useState("support");
    const [contactValue, setContactValue] = useState("");
    const [contactText, setContactText] = useState("");
    const [contactStatus, setContactStatus] = useState("");

    const [requests, setRequests] = useState(() => getSupportRequests());
    const [activeRequest, setActiveRequest] = useState(null);

    function handleProfileChange(event) {
        const { name, value } = event.target;

        setProfile((currentProfile) => ({
            ...currentProfile,
            [name]: value,
        }));
    }

    async function handleAvatarChange(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const avatar = await readFileAsDataUrl(file);

        setProfile((currentProfile) => ({
            ...currentProfile,
            avatar,
        }));
    }

    function handleSaveProfile(event) {
        event.preventDefault();

        const updatedProfile = saveAccountProfile({
            name: profile.name.trim() || "Исследователь",
            status: profile.status.trim() || "Дневник родных мест",
            avatar: profile.avatar,
        });

        setProfile(updatedProfile);
        onProfileUpdate?.(updatedProfile);
    }

    function handleSendContact(event) {
        event.preventDefault();

        const text = contactText.trim();

        if (!text) {
            setContactStatus("Напишите сообщение.");
            return;
        }

        saveSupportRequest({
            type: contactType,
            contact: contactValue.trim(),
            text,
        });

        setRequests(getSupportRequests());
        setContactText("");
        setContactValue("");
        setContactStatus("Обращение сохранено. Мы разберёмся.");
    }

    function handleDeleteRequest(requestId) {
        const isConfirmed = window.confirm("Удалить это обращение?");

        if (!isConfirmed) {
            return;
        }

        const updatedRequests = deleteSupportRequest(requestId);
        setRequests(updatedRequests);
    }

    if (view === "requests") {
        return (
            <div className="account-book-section">
                <h1>Обращения</h1>

                <button
                    className="account-book-section__button account-settings-contact"
                    type="button"
                    onClick={() => setView("settings")}
                >
                    ← Назад к настройкам
                </button>

                {requests.length === 0 ? (
                    <div className="account-book-empty">
                        <h2>Обращений пока нет</h2>

                        <p>
                            Здесь будут ваши жалобы, предложения и обращения в поддержку.
                        </p>
                    </div>
                ) : (
                    <div className="account-support-list">
                        {requests.map((request) => (
                            <article className="account-support-item" key={request.id}>
                                <div>
                                    <strong>
                                        {supportTypeTitles[request.type] ?? "Обращение"}
                                    </strong>

                                    {request.status === "new" && (
                                        <span className="account-support-item__badge">
                                            Новое
                                        </span>
                                    )}
                                </div>

                                <div className="account-support-item__actions">
                                    <button
                                        className="account-book-place__action"
                                        type="button"
                                        onClick={() => setActiveRequest(request)}
                                    >
                                        Посмотреть
                                    </button>

                                    <button
                                        className="account-book-place__action account-book-place__action--danger"
                                        type="button"
                                        onClick={() => handleDeleteRequest(request.id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {activeRequest && (
                    <div className="account-contact-modal" role="dialog" aria-modal="true">
                        <div className="account-contact-modal__card">
                            <button
                                className="account-contact-modal__close"
                                type="button"
                                onClick={() => setActiveRequest(null)}
                                aria-label="Закрыть окно"
                            >
                                ×
                            </button>

                            <h2>{supportTypeTitles[activeRequest.type] ?? "Обращение"}</h2>

                            {activeRequest.contact && (
                                <p>
                                    <strong>Контакт:</strong> {activeRequest.contact}
                                </p>
                            )}

                            <p>{activeRequest.text}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="account-book-section">
            <h1>Настройки</h1>

            <form className="account-settings-form" onSubmit={handleSaveProfile}>
                <label>
                    <span>Имя</span>
                    <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                    />
                </label>

                <label>
                    <span>Статус</span>
                    <input
                        type="text"
                        name="status"
                        value={profile.status}
                        onChange={handleProfileChange}
                    />
                </label>

                <label>
                    <span>Фото профиля</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </label>

                <button className="account-book-section__button" type="submit">
                    Сохранить профиль
                </button>
            </form>

            <button
                className="account-book-section__button account-settings-contact"
                type="button"
                onClick={() => setContactOpen(true)}
            >
                Связаться
            </button>

            <button
                className="account-book-section__button account-settings-contact"
                type="button"
                onClick={() => setView("requests")}
            >
                Обращения
            </button>

            {contactOpen && (
                <div className="account-contact-modal" role="dialog" aria-modal="true">
                    <div className="account-contact-modal__card">
                        <button
                            className="account-contact-modal__close"
                            type="button"
                            onClick={() => setContactOpen(false)}
                            aria-label="Закрыть окно"
                        >
                            ×
                        </button>

                        <h2>Связаться</h2>

                        <div className="account-contact-modal__tabs">
                            <button
                                type="button"
                                className={contactType === "support" ? "is-active" : ""}
                                onClick={() => setContactType("support")}
                            >
                                Поддержка
                            </button>

                            <button
                                type="button"
                                className={contactType === "idea" ? "is-active" : ""}
                                onClick={() => setContactType("idea")}
                            >
                                Предложение
                            </button>

                            <button
                                type="button"
                                className={contactType === "report" ? "is-active" : ""}
                                onClick={() => setContactType("report")}
                            >
                                Жалоба
                            </button>
                        </div>

                        <form className="account-contact-form" onSubmit={handleSendContact}>
                            <input
                                type="text"
                                value={contactValue}
                                placeholder="Email или Telegram для ответа"
                                onChange={(event) => setContactValue(event.target.value)}
                            />

                            <textarea
                                rows="5"
                                value={contactText}
                                placeholder={
                                    contactType === "report"
                                        ? "На кого или на что жалоба, и что произошло?"
                                        : "Напишите сообщение..."
                                }
                                onChange={(event) => {
                                    setContactText(event.target.value);
                                    setContactStatus("");
                                }}
                            />

                            {contactStatus && <p>{contactStatus}</p>}

                            <button className="account-book-section__button" type="submit">
                                Отправить
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}