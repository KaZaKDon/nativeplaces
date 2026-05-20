export const MAP_CATEGORY_ALL = "all";

export const mapCategories = [
    { id: MAP_CATEGORY_ALL, title: "Все" },
    { id: "real-estate", title: "Недвижимость" },
    { id: "rent", title: "Аренда" },
    { id: "recreation", title: "Базы отдыха" },
    { id: "fishing", title: "Рыбалка" },
    { id: "hunting", title: "Охота" },
    { id: "nature", title: "Природа" },
];

export function getMapCategoryById(categoryId) {
    return mapCategories.find((category) => category.id === categoryId) ?? null;
}

export function isKnownMapCategory(categoryId) {
    return Boolean(getMapCategoryById(categoryId));
}
