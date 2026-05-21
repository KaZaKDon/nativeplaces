import { Link } from "react-router-dom";

import "./HomePage.css";

export function HomePage() {
    return (
        <main className="home-page">
            <section className="hero">
                <div className="hero__overlay" />

                <header className="hero__header">
                    <Link className="hero__brand" to="/" aria-label="Родные места">
                        <span className="hero__brand-mark">⌖</span>
                    </Link>

                    <nav className="hero__nav">
                        <Link className="hero__login hero__login--hidden" to="/login">
                            Войти
                        </Link>

                        <Link className="hero__login" to="/account">
                            Кабинет
                        </Link>
                    </nav>
                </header>

                <div className="hero__content">
                    <div className="hero__text">
                        <h1 className="hero__title">Родные места</h1>

                        <p className="hero__subtitle">
                            Недвижимость, аренда, отдых, рыбалка и природа на одной карте.
                        </p>
                    </div>

                    <div className="hero__actions">
                        <Link className="hero__button hero__button--primary" to="/map">
                            Исследовать карту
                        </Link>

                        <Link className="hero__button hero__button--secondary" to="/categories">
                            Категории
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}