const SUPPORT_REQUESTS_KEY = "nativeplaces-support-requests";

export const supportTypeTitles = {
    support: "Поддержка",
    idea: "Предложение",
    report: "Жалоба",
};

function createRequestId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `support-${Date.now()}`;
}

export function getSupportRequests() {
    try {
        const rawValue = localStorage.getItem(SUPPORT_REQUESTS_KEY);

        if (!rawValue) {
            return [];
        }

        const requests = JSON.parse(rawValue);

        return Array.isArray(requests) ? requests : [];
    } catch {
        return [];
    }
}

export function saveSupportRequest(request) {
    const requests = getSupportRequests();

    const newRequest = {
        id: createRequestId(),
        type: request.type,
        text: request.text,
        status: "new",
        createdAt: new Date().toISOString(),
    };

    const updatedRequests = [newRequest, ...requests];

    localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify(updatedRequests));

    return updatedRequests;
}

export function deleteSupportRequest(requestId) {
    const updatedRequests = getSupportRequests().filter((request) => {
        return String(request.id) !== String(requestId);
    });

    localStorage.setItem(
        SUPPORT_REQUESTS_KEY,
        JSON.stringify(updatedRequests),
    );

    return updatedRequests;
}