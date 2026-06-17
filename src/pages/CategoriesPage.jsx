import { Link } from "react-router-dom";

import { categoryCards } from "../shared/config/categoryConfig";
import { createMapCategorySearchParams } from "../shared/map/categoryUrl";

import "./CategoriesPage.css";

function createCategoryMapLink(categoryId) {
    const searchParams = createMapCategorySearchParams(categoryId);
    const search = searchParams.toString();

    return search ? `/map?${search}` : "/map";
}

export function CategoriesPage() {
    return (
        <main className="categories-page">
            <div className="categories-page__overlay" />

            <header className="categories-header">
                <Link className="categories-header__back" to="/">
                    ← На главную
                </Link>

                <Link
                    className="categories-page__add-button"
                    to="/submit"
                >
                    Добавить место
                </Link>

                <Link className="categories-header__map" to="/map">
                    Открыть всю карту
                </Link>
            </header>

            <section className="categories-hero">
                <h1>Категории мест</h1>

                <p>
                    Начните с интересующего направления — карта откроется уже с нужными
                    объектами.
                </p>
            </section>

            <section className="category-board" aria-label="Категории">
                {categoryCards.map((category, index) => (
                    <Link
                        key={category.id}
                        className={`category-card category-card--${category.id}`}
                        to={createCategoryMapLink(category.id)}
                        style={{
                            "--i": index,
                        }}
                    >
                        <h2>{category.title}</h2>

                        <p>{category.description}</p>
                    </Link>
                ))}
            </section>
        </main>
    );
}
