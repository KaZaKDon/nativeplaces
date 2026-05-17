import "./CategoriesPage.css";

const categories = [
    {
        id: "real-estate",
        title: "Недвижимость",
        description: "Дома, участки и загородные объекты у воды и природы.",
        link: "/map?category=real-estate",
    },
    {
        id: "rent",
        title: "Аренда",
        description: "Дома, гостиницы, глэмпинги и места для временного отдыха.",
        link: "/map?category=rent",
    },
    {
        id: "recreation",
        title: "Базы отдыха",
        description: "Базы, туркомплексы и места для отдыха на природе.",
        link: "/map?category=recreation",
    },
    {
        id: "fishing",
        title: "Рыбалка",
        description: "Реки, водоемы, берега и места для рыбалки.",
        link: "/map?category=fishing",
    },
    {
        id: "hunting",
        title: "Охота",
        description: "Охотничьи территории, базы и природные зоны.",
        link: "/map?category=hunting",
    },
    {
        id: "nature",
        title: "Природа",
        description: "Озера, степи, леса и природные достопримечательности.",
        link: "/map?category=nature",
    },
];

export function CategoriesPage() {
    return (
        <main className="categories-page">
            <div className="categories-page__overlay" />

            <header className="categories-header">
                <a className="categories-header__back" href="/">
                    ← На главную
                </a>

                <a className="categories-header__map" href="/map">
                    Открыть всю карту
                </a>
            </header>

            <section className="categories-hero">

                <h1>Категории мест</h1>

                <p>
                    Начните с интересующего направления — карта откроется уже с нужными
                    объектами.
                </p>
            </section>

            <section className="category-board" aria-label="Категории">
                {categories.map((category, index) => (
                    <a
                        key={category.id}
                        className={`category-card category-card--${category.id}`}
                        href={category.link}
                        style={{
                            "--i": index,
                        }}
                    >
                        <h2>{category.title}</h2>

                        <p>{category.description}</p>
                    </a>
                ))}
            </section>
        </main>
    );
}