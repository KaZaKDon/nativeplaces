import { useState } from "react";

import { profileApi } from "../../../../shared/api/profileApi";
import { useAuth } from "../../../../shared/auth/useAuth";
import {
    deleteSupportRequest,
    getSupportRequests,
    saveSupportRequest,
    supportTypeTitles,
} from "../../../../shared/storage/supportStorage";
import { getMediaUrl } from "../../../../shared/api/mediaUrl";

import "./AccountSettingsSection.css";

function mapUserToProfile(user) {
    return {
        name: user?.first_name || "Исследователь",
        status: user?.profile_status || "Дневник родных мест",
        avatar: getMediaUrl(user?.avatar),
        phone: user?.phone || "",
        telegram: user?.telegram || "",
    };
}

export function AccountSettingsSection({ onProfileUpdate }) {
    const { user, updateUser } = useAuth();

    const [view, setView] = useState("settings");

    const [profile, setProfile] = useState(() => mapUserToProfile(user));
    const [profileStatus, setProfileStatus] = useState("");

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

        setProfileStatus("");
    }

    async function handleAvatarChange(event) {
        const file = event.target.files?.[0];

        console.log("AVATAR_STEP_1 file:", file);

        if (!file) {
            setProfileStatus("Файл не выбран.");
            return;
        }

        const maxAvatarSize = 3 * 1024 * 1024;

        if (file.size > maxAvatarSize) {
            setProfileStatus("Фото слишком большое. Максимальный размер — 3 МБ.");
            event.target.value = "";
            return;
        }

        setProfileStatus("Загружаем фото...");

        try {
            console.log("AVATAR_STEP_2 before upload");

            const data = await profileApi.uploadAvatar(file);

            console.log("AVATAR_STEP_3 response:", data);

            const updatedProfile = {
                ...profile,
                avatar: getMediaUrl(data.avatar),
            };

            setProfile(updatedProfile);
            updateUser({
                avatar: data.avatar,
            });
            onProfileUpdate?.(updatedProfile);

            setProfileStatus("Фото профиля обновлено.");
        } catch (error) {
            console.error("AVATAR_UPLOAD_ERROR:", error);
            setProfileStatus(error.message || "Не удалось обновить фото.");
        }
    }

    async function handleSaveProfile(event) {
        event.preventDefault();

        setProfileStatus("");

        const nextName = profile.name.trim() || "Исследователь";
        const nextStatus = profile.status.trim();

        try {
            const data = await profileApi.updateProfile({
                firstName: nextName,
                profileStatus: nextStatus,
                phone: profile.phone,
                telegram: profile.telegram,
            });

            const updatedProfile = {
                name: data.profile.first_name || "Исследователь",
                status: data.profile.profile_status || "Дневник родных мест",
                avatar: profile.avatar,
                phone: data.profile.phone || "",
                telegram: data.profile.telegram || "",
            };

            setProfile(updatedProfile);
            updateUser({
                first_name: data.profile.first_name,
                profile_status: data.profile.profile_status,
                phone: data.profile.phone,
                telegram: data.profile.telegram,
            });
            onProfileUpdate?.(updatedProfile);

            setProfileStatus("Профиль сохранён.");
        } catch (error) {
            setProfileStatus(error.message || "Не удалось сохранить профиль.");
        }
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

                {profileStatus && <p>{profileStatus}</p>}

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