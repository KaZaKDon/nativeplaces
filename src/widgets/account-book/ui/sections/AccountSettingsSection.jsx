import { useEffect, useState } from "react";

import { profileApi } from "../../../../shared/api/profileApi";
import { appealsApi } from "../../../../shared/api/appealsApi";
import { useAuth } from "../../../../shared/auth/useAuth";
import { getMediaUrl } from "../../../../shared/api/mediaUrl";

import "./AccountSettingsSection.css";

const appealTypeTitles = {
    support: "Поддержка",
    idea: "Предложение",
};

const appealStatusTitles = {
    new: "Новое",
    in_work: "В работе",
    closed: "Рассмотрено",
};

function mapUserToProfile(user) {
    return {
        name: user?.first_name || "Исследователь",
        status: user?.profile_status || "Дневник родных мест",
        avatar: getMediaUrl(user?.avatar),
        phone: user?.phone || "",
        telegram: user?.telegram || "",
    };
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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
    const [contactSending, setContactSending] = useState(false);

    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestsError, setRequestsError] = useState("");
    const [activeRequest, setActiveRequest] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadAppeals() {
            setRequestsLoading(true);
            setRequestsError("");

            try {
                const data = await appealsApi.getMyAppeals();

                if (!isMounted) {
                    return;
                }

                setRequests(data.appeals);
            } catch (error) {
                console.error("Не удалось загрузить обращения:", error);

                if (isMounted) {
                    setRequests([]);
                    setRequestsError(
                        error.message || "Не удалось загрузить обращения."
                    );
                }
            } finally {
                if (isMounted) {
                    setRequestsLoading(false);
                }
            }
        }

        loadAppeals();

        return () => {
            isMounted = false;
        };
    }, []);

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
            const data = await profileApi.uploadAvatar(file);

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

    async function handleSendContact(event) {
        event.preventDefault();

        const text = contactText.trim();

        if (!text) {
            setContactStatus("Напишите сообщение.");
            return;
        }

        setContactSending(true);
        setContactStatus("");

        try {
            await appealsApi.createAppeal({
                type: contactType,
                contact: contactValue.trim(),
                message: text,
            });

            const data = await appealsApi.getMyAppeals();

            setRequests(data.appeals);
            setContactText("");
            setContactValue("");
            setContactStatus("Обращение отправлено.");
        } catch (error) {
            console.error("Не удалось отправить обращение:", error);
            setContactStatus(error.message || "Не удалось отправить обращение.");
        } finally {
            setContactSending(false);
        }
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

                {requestsLoading ? (
                    <div className="account-book-empty">
                        <h2>Загружаем обращения</h2>
                        <p>Получаем ваши обращения из базы.</p>
                    </div>
                ) : requestsError ? (
                    <div className="account-book-empty">
                        <h2>Не удалось загрузить обращения</h2>
                        <p>{requestsError}</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="account-book-empty">
                        <h2>Обращений пока нет</h2>
                        <p>
                            Здесь будут ваши вопросы в поддержку и предложения по проекту.
                        </p>
                    </div>
                ) : (
                    <div className="account-support-list">
                        {requests.map((request) => (
                            <article
                                className="account-support-item"
                                key={request.id}
                            >
                                <div>
                                    <strong>
                                        {appealTypeTitles[request.type] ??
                                            "Обращение"}
                                    </strong>

                                    <span className="account-support-item__badge">
                                        {appealStatusTitles[request.status] ??
                                            request.status}
                                    </span>

                                    {request.createdAt && (
                                        <p>{formatDate(request.createdAt)}</p>
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
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {activeRequest && (
                    <div
                        className="account-contact-modal"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="account-contact-modal__card">
                            <button
                                className="account-contact-modal__close"
                                type="button"
                                onClick={() => setActiveRequest(null)}
                                aria-label="Закрыть окно"
                            >
                                ×
                            </button>

                            <h2>
                                {appealTypeTitles[activeRequest.type] ??
                                    "Обращение"}
                            </h2>

                            <p>
                                <strong>Статус:</strong>{" "}
                                {appealStatusTitles[activeRequest.status] ??
                                    activeRequest.status}
                            </p>

                            {activeRequest.contact && (
                                <p>
                                    <strong>Контакт:</strong>{" "}
                                    {activeRequest.contact}
                                </p>
                            )}

                            {activeRequest.createdAt && (
                                <p>
                                    <strong>Дата:</strong>{" "}
                                    {formatDate(activeRequest.createdAt)}
                                </p>
                            )}

                            <p>{activeRequest.text}</p>

                            {activeRequest.adminResponse ? (
                                <div className="account-support-response">
                                    <strong>Ответ администрации</strong>
                                    <p>{activeRequest.adminResponse}</p>
                                </div>
                            ) : (
                                <div className="account-support-response">
                                    <strong>Ответ администрации</strong>
                                    <p>Пока ответа нет.</p>
                                </div>
                            )}
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
                    <span>Телефон</span>
                    <input
                        type="text"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                    />
                </label>

                <label>
                    <span>Telegram</span>
                    <input
                        type="text"
                        name="telegram"
                        value={profile.telegram}
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

            <div className="account-settings-actions">

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

            </div>

            {contactOpen && (
                <div
                    className="account-contact-modal"
                    role="dialog"
                    aria-modal="true"
                >
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
                                className={
                                    contactType === "support" ? "is-active" : ""
                                }
                                onClick={() => {
                                    setContactType("support");
                                    setContactStatus("");
                                }}
                            >
                                Поддержка
                            </button>

                            <button
                                type="button"
                                className={
                                    contactType === "idea" ? "is-active" : ""
                                }
                                onClick={() => {
                                    setContactType("idea");
                                    setContactStatus("");
                                }}
                            >
                                Предложение
                            </button>
                        </div>

                        <form
                            className="account-contact-form"
                            onSubmit={handleSendContact}
                        >
                            <input
                                type="text"
                                value={contactValue}
                                placeholder="Email или Telegram для ответа"
                                onChange={(event) =>
                                    setContactValue(event.target.value)
                                }
                            />

                            <textarea
                                rows="5"
                                value={contactText}
                                placeholder={
                                    contactType === "idea"
                                        ? "Опишите предложение по проекту..."
                                        : "Напишите сообщение в поддержку..."
                                }
                                onChange={(event) => {
                                    setContactText(event.target.value);
                                    setContactStatus("");
                                }}
                            />

                            {contactStatus && <p>{contactStatus}</p>}

                            <button
                                className="account-book-section__button"
                                type="submit"
                                disabled={contactSending}
                            >
                                {contactSending ? "Отправляем..." : "Отправить"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}