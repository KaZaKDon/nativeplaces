import { useState } from "react";

import { accountBookTabs } from "../model/accountBookTabs";
import { AccountArchiveSection } from "./sections/AccountArchiveSection";
import { AccountFavoritesSection } from "./sections/AccountFavoritesSection";
import { AccountMessagesSection } from "./sections/AccountMessagesSection";
import { AccountPlacesSection } from "./sections/AccountPlacesSection";
import { AccountRoutesSection } from "./sections/AccountRoutesSection";
import { AccountSettingsSection } from "./sections/AccountSettingsSection";

import "./AccountBook.css";

const sectionComponents = {
    places: AccountPlacesSection,
    favorites: AccountFavoritesSection,
    messages: AccountMessagesSection,
    routes: AccountRoutesSection,
    archive: AccountArchiveSection,
    settings: AccountSettingsSection,
};

export function AccountBook() {
    const [activeTab, setActiveTab] = useState("places");

    const ActiveSection = sectionComponents[activeTab] || AccountPlacesSection;

    return (
        <section className="account-book" aria-label="Личный кабинет">
            <div className="account-book__left">
                <div className="account-book__avatar">РМ</div>

                <h2>Исследователь</h2>
                <p>Дневник родных мест</p>

                <div className="account-book__stats">
                    <div>
                        <strong>0</strong>
                        <span>мест</span>
                    </div>

                    <div>
                        <strong>0</strong>
                        <span>избранных</span>
                    </div>

                    <div>
                        <strong>0</strong>
                        <span>писем</span>
                    </div>
                </div>

                <blockquote>
                    «Память о местах делает нас ближе к своим корням»
                </blockquote>
            </div>

            <div className="account-book__right">
                <ActiveSection />
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