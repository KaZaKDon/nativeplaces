import { Link } from "react-router-dom";

import "./AccountPage.css";

export function AccountMessagesPage() {
    return (
        <main className="account-page">
            <section className="account-page__hero">
                <Link className="account-page__back" to="/account">
                    ← В кабинет
                </Link>

                <p className="account-page__eyebrow">Сообщения</p>

                <h1>Письма и обращения</h1>
            </section>
        </main>
    );
}