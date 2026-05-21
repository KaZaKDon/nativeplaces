export const submitCategories = [
    { id: "nature", title: "Природа" },
    { id: "fishing", title: "Рыбалка" },
    { id: "hunting", title: "Охота" },
    { id: "recreation", title: "Базы отдыха" },
    { id: "real-estate", title: "Недвижимость" },
    { id: "rent", title: "Аренда" },
];

export const categoryTypes = {
    nature: [
        { id: "lake", title: "Озеро" },
        { id: "river", title: "Река" },
        { id: "viewpoint", title: "Красивое место" },
        { id: "route", title: "Маршрут" },
    ],

    fishing: [
        { id: "river-fishing", title: "Река" },
        { id: "lake-fishing", title: "Озеро" },
        { id: "paid-fishing", title: "Платная рыбалка" },
        { id: "don-place", title: "Место на Дону" },
    ],

    hunting: [
        { id: "hunting-area", title: "Охотхозяйство" },
        { id: "guided-hunting", title: "Организованная охота" },
        { id: "season-place", title: "Сезонное место" },
    ],

    recreation: [
        { id: "recreation-base", title: "База отдыха" },
        { id: "guest-house", title: "Гостевой дом" },
        { id: "camping", title: "Кемпинг" },
        { id: "hotel", title: "Гостиница" },
        { id: "glamping", title: "Глэмпинг" },
    ],

    "real-estate": [
        { id: "house", title: "Дом" },
        { id: "apartment", title: "Квартира" },
        { id: "land", title: "Участок" },
        { id: "commercial", title: "Коммерческий объект" },
    ],

    rent: [
        { id: "rent-apartment", title: "Квартира" },
        { id: "rent-house", title: "Дом" },
        { id: "rent-room", title: "Комната" },
        { id: "rent-hotel", title: "Гостиница" },
        { id: "rent-camping", title: "Кемпинг" },
    ],
};

export const categoryFields = {
    "real-estate": [
        { name: "price", label: "Цена", placeholder: "Например, 7 500 000 ₽" },
        { name: "area", label: "Площадь", placeholder: "Например, 100 м²" },
        { name: "landArea", label: "Площадь участка", placeholder: "Например, 8 соток" },
        { name: "rooms", label: "Количество комнат", placeholder: "Например, 5 комнат" },
    ],

    rent: [
        { name: "price", label: "Цена аренды", placeholder: "Например, 25 000 ₽/мес." },
        { name: "area", label: "Площадь", placeholder: "Например, 60 м²" },
        { name: "rooms", label: "Количество комнат", placeholder: "Например, 2 комнаты" },
        { name: "period", label: "Срок аренды", placeholder: "Посуточно, месяц, длительно" },
    ],

    fishing: [
        { name: "season", label: "Сезон", placeholder: "Например, весна-лето" },
        { name: "fish", label: "Какая рыба", placeholder: "Например, карась, сазан, щука" },
        { name: "access", label: "Подъезд", placeholder: "Пешком, легковой авто, внедорожник" },
        { name: "format", label: "Формат", placeholder: "Берег, лодка, платная рыбалка" },
    ],

    hunting: [
        { name: "season", label: "Сезон", placeholder: "Например, весна / осень" },
        { name: "rules", label: "Правила", placeholder: "Кратко укажите основные условия" },
        { name: "permission", label: "Разрешения", placeholder: "Что нужно для участия" },
        { name: "organizer", label: "Организатор", placeholder: "Кто организует выезд" },
    ],

    recreation: [
        { name: "accommodation", label: "Размещение", placeholder: "Домики, номера, палатки" },
        { name: "capacity", label: "Количество мест", placeholder: "Например, до 20 человек" },
        { name: "food", label: "Питание", placeholder: "Есть / нет / по договоренности" },
        { name: "parking", label: "Парковка", placeholder: "Есть / нет" },
    ],
};

export function getFieldsByCategory(categoryId) {
    return categoryFields[categoryId] ?? [];
}

export function getTypesByCategory(categoryId) {
    return categoryTypes[categoryId] ?? [];
}