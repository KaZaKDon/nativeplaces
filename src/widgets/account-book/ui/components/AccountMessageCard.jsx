import { useState } from "react";
import { Link } from "react-router-dom";

import { addMessageToConversation } from "../../../../shared/storage/messagesStorage";

import "./AccountMessageCard.css";

function formatMessageTime(value) {
    if (!value) {
        return "";
    }

    return new Date(value).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function AccountMessageCard({
    conversation,
    onDelete,
    onConversationUpdate,
}) {
    const [replyText, setReplyText] = useState("");

    const messages = conversation.messages ?? [];
    const isNew = conversation.status === "new";

    function handleSendReply() {
        const text = replyText.trim();

        if (!text) {
            return;
        }

        const updatedConversations = addMessageToConversation(
            conversation.conversationId,
            {
                sender: "author",
                text,
            },
        );

        onConversationUpdate(updatedConversations);
        setReplyText("");
    }

    return (
        <article className={isNew ? "account-message-card is-new" : "account-message-card"}>
            <div className="account-message-card__head">
                <span>
                    {conversation.updatedAt
                        ? formatMessageTime(conversation.updatedAt)
                        : "Дата не указана"}
                </span>

                <strong>
                    {isNew ? "Новое" : `${messages.length} сообщ.`}
                </strong>
            </div>

            <h2>{conversation.placeTitle || "Объект не указан"}</h2>

            <div className="account-message-card__chat">
                {messages.map((message) => (
                    <div
                        className={
                            message.sender === "author"
                                ? "account-message-card__bubble account-message-card__bubble--author"
                                : "account-message-card__bubble"
                        }
                        key={message.id}
                    >
                        <p>{message.text}</p>

                        <time dateTime={message.createdAt}>
                            {formatMessageTime(message.createdAt)}
                        </time>
                    </div>
                ))}
            </div>

            <div className="account-message-card__reply">
                <textarea
                    rows="3"
                    value={replyText}
                    placeholder="Ответить..."
                    onChange={(event) => setReplyText(event.target.value)}
                />

                <button
                    className="account-book-place__action"
                    type="button"
                    onClick={handleSendReply}
                >
                    Отправить
                </button>
            </div>

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
                    className="account-book-place__action account-book-place__action--danger"
                    type="button"
                    onClick={() => onDelete(conversation.conversationId)}
                >
                    Удалить диалог
                </button>
            </div>
        </article>
    );
}