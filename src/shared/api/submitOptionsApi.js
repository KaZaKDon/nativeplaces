import { apiClient } from "./apiClient";

function normalizeOptions(data = {}) {
    return {
        ...data,
        categories: Array.isArray(data.categories) ? data.categories : [],
        types: Array.isArray(data.types) ? data.types : [],
    };
}

async function getFallbackOptions() {
    const [categoriesData, typesData] = await Promise.all([
        apiClient.get("/categories/index.php"),
        apiClient.get("/place-types/index.php"),
    ]);

    return normalizeOptions({
        categories: categoriesData.categories,
        types: typesData.types,
    });
}

export const submitOptionsApi = {
    async getCreateOptions() {
        try {
            const data = await apiClient.get("/places/create-options.php", undefined, {
                timeoutMs: 10000,
            });

            return normalizeOptions(data);
        } catch (error) {
            console.warn(
                "Не удалось загрузить create-options.php, пробуем отдельные справочники:",
                error
            );

            return getFallbackOptions();
        }
    },
};