import { useMemo, useState } from "react";

import { getFavoriteIds } from "../../../shared/storage/favoritesStorage";
import { getLocalPlaces } from "../../../shared/storage/localPlacesStorage";
import { getConversations } from "../../../shared/storage/messagesStorage";
import { useAuth } from "../../../shared/auth/useAuth";
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

    const [activeTab, setActiveTab] = useState("places");
    const [profileOverride, setProfileOverride] = useState(null);

    const profile = useMemo(() => {
        return profileOverride ?? mapUserToProfile(user);
    }, [profileOverride, user]);

    const stats = {
        places: getLocalPlaces().length,
        favorites: getFavoriteIds().length,
        messages: getConversations().length,
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
                        <strong>{stats.places}</strong>
                        <span>мест</span>
                    </div>

                    <div>
                        <strong>{stats.favorites}</strong>
                        <span>избранных</span>
                    </div>

                    <div>
                        <strong>{stats.messages}</strong>
                        <span>писем</span>
                    </div>
                </div>

                <blockquote>
                    «Память о местах делает нас ближе к своим корням»
                </blockquote>
            </div>

            <div className="account-book__right">
                <ActiveSection onProfileUpdate={setProfileOverride} />
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
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.title}
                    </button>
                ))}
            </nav>
        </section>
    );
}