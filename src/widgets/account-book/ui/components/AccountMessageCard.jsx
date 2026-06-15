import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { conversationsApi } from "../../../../shared/api/conversationsApi";
import { useAuth } from "../../../../shared/auth/useAuth";
import { MessageDialogModal } from "./MessageDialogModal";

import "./AccountMessageCard.css";

function formatMessageTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function AccountMessageCard({ conversation, onDelete }) {
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [messagesError, setMessagesError] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const currentUserId = Number(user?.id ?? 0);

    const lastMessage = useMemo(() => {
        return messages.length > 0 ? messages[messages.length - 1] : null;
    }, [messages]);

    const loadMessages = useCallback(async () => {
        setMessagesLoading(true);
        setMessagesError("");

        try {
            const data = await conversationsApi.getMessages(conversation.id);
            setMessages(data.messages);
        } catch (error) {
            console.error(error);
            setMessagesError(error.message || "Не удалось загрузить диалог.");
            setMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    }, [conversation.id]);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            loadMessages();
        }, 0);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [loadMessages]);

    return (
        <>
            <article className="account-message-card">
                <button
                    className="account-message-card__open"
                    type="button"
                    onClick={() => setDialogOpen(true)}
                >
                    <div className="account-message-card__head">
                        <span>
                            {conversation.lastMessageAt
                                ? formatMessageTime(conversation.lastMessageAt)
                                : "Дата не указана"}
                        </span>

                        <strong>{messages.length} сообщ.</strong>
                    </div>

                    <h2>{conversation.placeTitle || "Объект не указан"}</h2>

                    {conversation.ownerName && (
                        <p className="account-message-card__meta">
                            Автор: {conversation.ownerName}
                        </p>
                    )}

                    <div className="account-message-card__preview">
                        {messagesLoading ? (
                            <p>Загружаем диалог...</p>
                        ) : messagesError ? (
                            <p>{messagesError}</p>
                        ) : lastMessage ? (
                            <>
                                <strong>
                                    {Number(lastMessage.senderId) === currentUserId
                                        ? "Вы"
                                        : lastMessage.senderName}
                                </strong>
                                <p>{lastMessage.text}</p>
                            </>
                        ) : (
                            <p>В диалоге пока нет сообщений.</p>
                        )}
                    </div>
                </button>

                <div className="account-message-card__actions">
                    {conversation.placeSlug && (
                        <Link
                            className="account-book-place__action"
                            to={`/place/${conversation.placeSlug}`}
                        >
                            Открыть объект
                        </Link>
                    )}

                    <button
                        className="account-book-place__action"
                        type="button"
                        onClick={() => setDialogOpen(true)}
                    >
                        Открыть диалог
                    </button>

                    <button
                        className="account-book-place__action account-book-place__action--danger"
                        type="button"
                        onClick={() => onDelete(conversation.id)}
                    >
                        Удалить
                    </button>
                </div>
            </article>

            {dialogOpen && (
                <MessageDialogModal
                    conversation={conversation}
                    messages={messages}
                    currentUserId={currentUserId}
                    onClose={() => setDialogOpen(false)}
                    onMessagesChange={setMessages}
                    onReloadMessages={loadMessages}
                />
            )}
        </>
    );
}