import "./HomePage.css";

export function HomePage() {
    return (
        <main className="home-page">
            <section className="hero">
                <div className="hero__overlay" />

                <header className="hero__header">
                    <a className="hero__brand" href="/" aria-label="Родные места">
                        <span className="hero__brand-mark">⌖</span>
                    </a>

                    <nav className="hero__nav">
                        <button className="hero__login" type="button">
                            Войти
                        </button>
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
                        <a className="hero__button hero__button--primary" href="/map">
                            Исследовать карту
                        </a>

                        <a className="hero__button hero__button--secondary" href="/categories">
                            Категории
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}