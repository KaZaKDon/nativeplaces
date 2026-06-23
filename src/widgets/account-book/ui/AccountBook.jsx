import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../../shared/auth/useAuth";
import { favoritesApi } from "../../../shared/api/favoritesApi";
import { myPlacesApi } from "../../../shared/api/myPlacesApi";
import { conversationsApi } from "../../../shared/api/conversationsApi";
import { accountBookTabs } from "../model/accountBookTabs";
import { AccountArchiveSection } from "./sections/AccountArchiveSection";
import { AccountFavoritesSection } from "./sections/AccountFavoritesSection";
import { AccountMessagesSection } from "./sections/AccountMessagesSection";
import { AccountPlacesSection } from "./sections/AccountPlacesSection";
import { AccountRoutesSection } from "./sections/AccountRoutesSection";
import { AccountSettingsSection } from "./sections/AccountSettingsSection";
import { getMediaUrl } from "../../../shared/api/mediaUrl";

import "./AccountBook.css";

const sectionComponents = {
    places: AccountPlacesSection,
    favorites: AccountFavoritesSection,
    messages: AccountMessagesSection,
    routes: AccountRoutesSection,
    archive: AccountArchiveSection,
    settings: AccountSettingsSection,
};

function mapUserToProfile(user) {
    return {
        name: user?.first_name || "Исследователь",
        status: user?.profile_status || "Дневник родных мест",
        avatar: getMediaUrl(user?.avatar),
    };
}

export function AccountBook() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const queryTab = searchParams.get("tab");
    const activeTab = sectionComponents[queryTab] ? queryTab : "places";
    const [profileOverride, setProfileOverride] = useState(null);

    const [places, setPlaces] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [conversations, setConversations] = useState([]);

    const [placesLoading, setPlacesLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(true);

    const profile = useMemo(() => {
        return profileOverride ?? mapUserToProfile(user);
    }, [profileOverride, user]);

    useEffect(() => {
        let isMounted = true;

        async function loadPlaces() {
            try {
                const data = await myPlacesApi.getMyPlaces();

                if (!isMounted) {
                    return;
                }

                setPlaces(Array.isArray(data.places) ? data.places : []);
            } catch (error) {
                console.error("Не удалось загрузить мои места:", error);

                if (isMounted) {
                    setPlaces([]);
                }
            } finally {
                if (isMounted) {
                    setPlacesLoading(false);
                }
            }
        }

        loadPlaces();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadFavorites() {
            try {
                const data = await favoritesApi.getFavorites();

                if (!isMounted) {
                    return;
                }

                setFavorites(
                    Array.isArray(data.favorites) ? data.favorites : []
                );
            } catch (error) {
                console.error("Не удалось загрузить избранное:", error);

                if (isMounted) {
                    setFavorites([]);
                }
            } finally {
                if (isMounted) {
                    setFavoritesLoading(false);
                }
            }
        }

        loadFavorites();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadConversations() {
            try {
                const data = await conversationsApi.getConversations();

                if (!isMounted) {
                    return;
                }

                setConversations(
                    Array.isArray(data.conversations)
                        ? data.conversations
                        : []
                );
            } catch (error) {
                console.error("Не удалось загрузить диалоги:", error);

                if (isMounted) {
                    setConversations([]);
                }
            } finally {
                if (isMounted) {
                    setMessagesLoading(false);
                }
            }
        }

        loadConversations();

        return () => {
            isMounted = false;
        };
    }, []);

    function handleTabChange(tabId) {
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            nextParams.set("tab", tabId);
            return nextParams;
        });
    }

    const stats = {
        places: places.length,
        favorites: favorites.length,
        messages: conversations.length,
    };

    const ActiveSection = sectionComponents[activeTab] || AccountPlacesSection;

    return (
        <section className="account-book" aria-label="Личный кабинет">
            <div className="account-book__left">
                <div className="account-book__avatar">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} />
                    ) : (
                        "РМ"
                    )}
                </div>

                <h2>{profile.name}</h2>
                <p>{profile.status}</p>

                <div className="account-book__stats">
                    <div>
                        <strong>{placesLoading ? "…" : stats.places}</strong>
                        <span>мест</span>
                    </div>

                    <div>
                        <strong>
                            {favoritesLoading ? "…" : stats.favorites}
                        </strong>
                        <span>избранных</span>
                    </div>

                    <div>
                        <strong>
                            {messagesLoading ? "…" : stats.messages}
                        </strong>
                        <span>сообщений</span>
                    </div>
                </div>

                <blockquote>
                    «Память о местах делает нас ближе к своим корням»
                </blockquote>
            </div>

            <div className="account-book__right">
                <ActiveSection
                    places={places}
                    setPlaces={setPlaces}
                    placesLoading={placesLoading}
                    favorites={favorites}
                    setFavorites={setFavorites}
                    favoritesLoading={favoritesLoading}
                    onProfileUpdate={setProfileOverride}
                />
            </div>

            <nav className="account-book__tabs" aria-label="Разделы кабинета">
                {accountBookTabs.map((tab) => (
                    <button
                        className={
                            activeTab === tab.id
                                ? "account-book__tab account-book__tab--active"
                                : "account-book__tab"
                        }
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.title}
                    </button>
                ))}
            </nav>
        </section>
    );
}