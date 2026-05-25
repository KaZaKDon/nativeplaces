import { Link } from "react-router-dom";

import "./AccountPage.css";

export function AccountSettingsPage() {
    return (
        <main className="account-page">
            <section className="account-page__hero">
                <Link className="account-page__back" to="/account">
                    ← В кабинет
                </Link>

                <p className="account-page__eyebrow">Настройки</p>

                <h1>Профиль и параметры</h1>
            </section>
        </main>
    );
}