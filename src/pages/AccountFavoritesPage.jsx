import { Link } from "react-router-dom";

import "./AccountPage.css";

export function AccountFavoritesPage() {
    return (
        <main className="account-page">
            <section className="account-page__hero">
                <Link className="account-page__back" to="/account">
                    ← В кабинет
                </Link>

                <p className="account-page__eyebrow">Избранное</p>

                <h1>Сохранённые места</h1>
            </section>
        </main>
    );
}