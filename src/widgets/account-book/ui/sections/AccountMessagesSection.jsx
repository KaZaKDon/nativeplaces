export function AccountMessagesSection() {
    return (
        <div className="account-book-section">
            <h1>Сообщения</h1>

            <p>
                Письма автору, вопросы по объектам и история обращений.
            </p>

            <div className="account-book-empty">
                <h2>Сообщений пока нет</h2>
                <p>Позже сюда попадут обращения со страниц объектов.</p>
            </div>
        </div>
    );
}