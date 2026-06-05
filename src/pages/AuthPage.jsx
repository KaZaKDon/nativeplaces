import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { EyeIcon } from "../shared/icons/EyeIcon";
import { EyeOffIcon } from "../shared/icons/EyeOffIcon";
import { useAuth } from "../shared/auth/useAuth";

import "./AuthPage.css";

const initialForm = {
    firstName: "",
    email: "",
    password: "",
};

export function AuthPage() {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [mode, setMode] = useState("login");
    const [form, setForm] = useState(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isLoginMode = mode === "login";

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function handleModeChange(nextMode) {
        setMode(nextMode);
        setErrorMessage("");
        setShowPassword(false);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            if (isLoginMode) {
                await login({
                    email: form.email,
                    password: form.password,
                });
            } else {
                await register({
                    firstName: form.firstName,
                    email: form.email,
                    password: form.password,
                });
            }

            setForm(initialForm);
            setShowPassword(false);
            navigate("/account");
        } catch (error) {
            setErrorMessage(error.message || "Не удалось выполнить действие");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-page__map" />
            <div className="auth-page__overlay" />

            <section className="auth-card" aria-label="Авторизация">
                <div className="auth-card__header">
                    <p className="auth-card__eyebrow">Native Places</p>

                    <h1 className="auth-card__title">
                        {isLoginMode ? "Добро пожаловать" : "Создание аккаунта"}
                    </h1>

                    <p className="auth-card__subtitle">
                        {isLoginMode
                            ? "Войдите, чтобы сохранять места, создавать маршруты и публиковать свои объекты."
                            : "Создайте аккаунт, чтобы добавлять места, маршруты и пользоваться личным кабинетом."}
                    </p>
                </div>

                <div className="auth-tabs" role="tablist" aria-label="Выбор действия">
                    <button
                        className={
                            isLoginMode
                                ? "auth-tabs__button auth-tabs__button--active"
                                : "auth-tabs__button"
                        }
                        type="button"
                        onClick={() => handleModeChange("login")}
                    >
                        Вход
                    </button>

                    <button
                        className={
                            !isLoginMode
                                ? "auth-tabs__button auth-tabs__button--active"
                                : "auth-tabs__button"
                        }
                        type="button"
                        onClick={() => handleModeChange("register")}
                    >
                        Регистрация
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLoginMode && (
                        <label className="auth-form__field">
                            <span>Имя</span>
                            <input
                                name="firstName"
                                type="text"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder="Например, Дмитрий"
                                autoComplete="given-name"
                                required
                            />
                        </label>
                    )}

                    <label className="auth-form__field">
                        <span>Email</span>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="auth-form__field">
                        <span>Пароль</span>

                        <div className="auth-form__password">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Минимум 6 символов"
                                autoComplete={isLoginMode ? "current-password" : "new-password"}
                                required
                                minLength={6}
                            />

                            <button
                                className="auth-form__password-toggle"
                                type="button"
                                onClick={() => setShowPassword((currentValue) => !currentValue)}
                                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                            >
                                {showPassword ? (
                                    <EyeOffIcon aria-hidden="true" />
                                ) : (
                                    <EyeIcon aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </label>

                    {errorMessage && (
                        <p className="auth-form__error" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        className="auth-form__submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Подождите..."
                            : isLoginMode
                                ? "Войти"
                                : "Создать аккаунт"}
                    </button>
                </form>
            </section>
        </main>
    );
}