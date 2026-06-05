const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
    constructor(message, options = {}) {
        super(message);

        this.name = "ApiError";
        this.status = options.status ?? 0;
        this.data = options.data ?? null;
        this.extra = options.extra ?? null;
    }
}

function buildUrl(endpoint, params) {
    const normalizedEndpoint = endpoint.startsWith("/") ?
        endpoint :
        `/${endpoint}`;

    const url = new URL(`${API_BASE_URL}${normalizedEndpoint}`, window.location.origin);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") {
                return;
            }

            url.searchParams.set(key, String(value));
        });
    }

    return url.toString();
}

async function parseJsonResponse(response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new ApiError("Сервер вернул некорректный JSON", {
            status: response.status,
            data: text,
        });
    }
}

export async function apiRequest(endpoint, options = {}) {
    const {
        method = "GET",
            params,
            body,
            headers,
            isFormData = false,
    } = options;

    const response = await fetch(buildUrl(endpoint, params), {
        method,
        credentials: "include",
        headers: isFormData ?
            headers :
            {
                "Content-Type": "application/json",
                ...headers,
            },
        body: body ?
            isFormData ?
            body :
            JSON.stringify(body) :
            undefined,
    });

    const result = await parseJsonResponse(response);

    if (!response.ok || result?.success === false) {
        throw new ApiError(result?.message || "Ошибка запроса к серверу", {
            status: response.status,
            data: result,
            extra: result?.extra ?? null,
        });
    }

    return result?.data ?? result;
}

export const apiClient = {
    get(endpoint, params) {
        return apiRequest(endpoint, {
            method: "GET",
            params,
        });
    },

    post(endpoint, body) {
        return apiRequest(endpoint, {
            method: "POST",
            body,
        });
    },

    postForm(endpoint, formData) {
        return apiRequest(endpoint, {
            method: "POST",
            body: formData,
            isFormData: true,
        });
    },
};