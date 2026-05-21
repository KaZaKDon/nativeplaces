import { Link } from "react-router-dom";

import "./AccountPage.css";

const accountSections = [
    {
        title: "Мои места",
        description: "Объекты, которые вы добавили на карту.",
    },
    {
        title: "Сообщения",
        description: "Вопросы по вашим объявлениям и объектам.",
    },
    {
        title: "Избранное",
        description: "Сохранённые места, маршруты и объявления.",
    },
    {
        title: "Профиль",
        description: "Имя, контакты и данные аккаунта.",
    },
];

export function AccountPage() {
    return (
        <main className="account-page">
            <section className="account-page__hero">
                <Link className="account-page__back" to="/">
                    ← На главную
                </Link>

                <p className="account-page__eyebrow">Личный кабинет</p>

                <h1>Ваши места, сообщения и избранное</h1>

                <div className="account-page__grid">
                    {accountSections.map((section) => (
                        <article className="account-card" key={section.title}>
                            <h2>{section.title}</h2>
                            <p>{section.description}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}