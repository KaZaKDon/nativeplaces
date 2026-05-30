import { useState } from "react";

import {
    deleteConversation,
    getConversations,
    markConversationAsRead,
} from "../../../../shared/storage/messagesStorage";
import { AccountBookPager } from "../components/AccountBookPager";
import { AccountMessageCard } from "../components/AccountMessageCard";

export function AccountMessagesSection() {
    const [conversations, setConversations] = useState(() => getConversations());

    function handleOpenConversation(conversation) {
        if (conversation.status !== "new") {
            return;
        }

        const updatedConversations = markConversationAsRead(conversation.conversationId);
        setConversations(updatedConversations);
    }

    function handleDeleteConversation(conversationId) {
        const isConfirmed = window.confirm("Удалить этот диалог?");

        if (!isConfirmed) {
            return;
        }

        const updatedConversations = deleteConversation(conversationId);
        setConversations(updatedConversations);
    }

    return (
        <div className="account-book-section">
            <h1>Сообщения</h1>

            {conversations.length === 0 ? (
                <div className="account-book-empty">
                    <h2>Сообщений пока нет</h2>
                    <p>Позже сюда попадут обращения со страниц объектов.</p>
                </div>
            ) : (
                <div className="account-book-section__body">
                    <AccountBookPager
                        items={conversations}
                        onPageChange={handleOpenConversation}
                    >
                        {(conversation) => (
                            <AccountMessageCard
                                conversation={conversation}
                                onDelete={handleDeleteConversation}
                                onConversationUpdate={setConversations}
                            />
                        )}
                    </AccountBookPager>
                </div>
            )}
        </div>
    );
}