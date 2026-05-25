import { Link } from "react-router-dom";

import { AccountBook } from "../widgets/account-book";

import "./AccountPage.css";

export function AccountPage() {
    return (
        <main className="account-page">
            <section className="account-page__hero">
                <Link className="account-page__back" to="/">
                    ← На главную
                </Link>

                <AccountBook />
            </section>
        </main>
    );
}