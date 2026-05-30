const MESSAGES_KEY = "nativeplaces-conversations";

function createId(prefix) {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}`;
}

export function getConversations() {
    try {
        const rawValue = localStorage.getItem(MESSAGES_KEY);

        if (!rawValue) {
            return [];
        }

        const conversations = JSON.parse(rawValue);

        return Array.isArray(conversations) ? conversations : [];
    } catch {
        return [];
    }
}

export function saveMessage(message) {
    const conversations = getConversations();
    const conversationId = String(message.placeId);
    const createdAt = new Date().toISOString();

    const newChatMessage = {
        id: createId("message"),
        text: message.text,
        sender: "user",
        createdAt,
    };

    const existingConversation = conversations.find((conversation) => {
        return String(conversation.conversationId) === conversationId;
    });

    let updatedConversations;

    if (existingConversation) {
        updatedConversations = conversations.map((conversation) => {
            if (String(conversation.conversationId) !== conversationId) {
                return conversation;
            }

            return {
                ...conversation,
                updatedAt: createdAt,
                status: "new",
                messages: [...(conversation.messages ?? []), newChatMessage],
            };
        });
    } else {
        updatedConversations = [
            {
                conversationId,
                placeId: message.placeId,
                placeSlug: message.placeSlug,
                placeTitle: message.placeTitle,
                placeImage: message.placeImage,
                placeCategoryTitle: message.placeCategoryTitle,
                createdAt,
                updatedAt: createdAt,
                status: "new",
                messages: [newChatMessage],
            },
            ...conversations,
        ];
    }

    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedConversations));

    return updatedConversations;
}

export function markConversationAsRead(conversationId) {
    const updatedConversations = getConversations().map((conversation) => {
        if (String(conversation.conversationId) !== String(conversationId)) {
            return conversation;
        }

        return {
            ...conversation,
            status: "read",
        };
    });

    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedConversations));

    return updatedConversations;
}

export function deleteConversation(conversationId) {
    const updatedConversations = getConversations().filter((conversation) => {
        return String(conversation.conversationId) !== String(conversationId);
    });

    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedConversations));

    return updatedConversations;
}

export function addMessageToConversation(conversationId, message) {
    const conversations = getConversations();
    const createdAt = new Date().toISOString();

    const updatedConversations = conversations.map((conversation) => {
        if (String(conversation.conversationId) !== String(conversationId)) {
            return conversation;
        }

        const newMessage = {
            id: createId("message"),
            sender: message.sender || "author",
            text: message.text,
            createdAt,
        };

        return {
            ...conversation,
            updatedAt: createdAt,
            status: "read",
            messages: [...(conversation.messages ?? []), newMessage],
        };
    });

    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedConversations));

    return updatedConversations;
}