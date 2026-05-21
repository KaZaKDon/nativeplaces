
---

## `docs/03-data-architecture.md`

```md
# Родные Места — структура объектов и данных

## Общая идея

Проект строится вокруг объекта `place`.

`place` может быть:

- природным местом;
- местом для рыбалки;
- охотничьей территорией;
- базой отдыха;
- объектом недвижимости;
- арендным объектом;
- маршрутом;
- туристической точкой.

---

## Текущий frontend-объект

Пример объекта:

```js
{
    id: 1,
    slug: "manych-gudilo",
    title: "Маныч-Гудило",

    categorySlug: "nature",
    categoryTitle: "Природа",

    typeSlug: "lake",

    shortDescription: "Крупное солёное озеро среди степных ландшафтов юга России.",

    description: "Маныч-Гудило — крупное солёное озеро в Кумо-Манычской впадине.",

    fullDescription: "Полное описание объекта...",

    locality: "Ростовская область",
    address: "Ростовская область",

    tags: [
        "озеро",
        "степь",
        "птицы"
    ],

    position: [46.48, 42.78],

    image: "/images/places/manych-gudilo/hero.webp",

    gallery: [
        "/images/places/manych-gudilo/01.webp",
        "/images/places/manych-gudilo/02.webp",
        "/images/places/manych-gudilo/03.webp"
    ],

    price: null,
    area: null,
    landArea: null,

    contact: {
        name: "",
        value: ""
    },

    extraFields: {},

    source: "static",
    status: "published",
    createdAt: "2026-05-21T00:00:00.000Z"
}
Основные поля
id

Уникальный идентификатор.

На frontend demo-этапе может быть:

1
"local-123"
crypto.randomUUID()

В базе данных будет числовой AUTO_INCREMENT.

slug

Человекочитаемый URL.

Пример:

/place/manych-gudilo

Используется для страницы объекта.

title

Название объекта.

Примеры:

Маныч-Гудило
Дом в Вёшенской
Вяжинское охотхозяйство
categorySlug

Основная категория.

Варианты:

nature
fishing
hunting
recreation
real-estate
rent
typeSlug

Тип объекта внутри категории.

Примеры:

house
apartment
lake
river
camping
hotel
hunting-area
Категории и типы
Природа
lake
river
viewpoint
route
Рыбалка
river-fishing
lake-fishing
paid-fishing
don-place
Охота
hunting-area
guided-hunting
season-place
Базы отдыха
recreation-base
guest-house
camping
hotel
glamping
Недвижимость
house
apartment
land
commercial
Аренда
rent-apartment
rent-house
rent-room
rent-hotel
rent-camping
Динамические поля

Динамические поля зависят от категории.

Недвижимость
{
    price: "7 500 000 ₽",
    area: "100 м²",
    landArea: "8 соток",
    rooms: "5 комнат"
}
Аренда
{
    price: "25 000 ₽/мес.",
    area: "60 м²",
    rooms: "2 комнаты",
    period: "длительно"
}
Рыбалка
{
    season: "весна-лето",
    fish: "карась, сазан, щука",
    access: "легковой авто",
    format: "берег"
}
Охота
{
    season: "осень",
    rules: "по согласованию",
    permission: "разрешение обязательно",
    organizer: "организатор выезда"
}
Базы отдыха
{
    accommodation: "домики",
    capacity: "до 20 человек",
    food: "по договоренности",
    parking: "есть"
}
Структура под MySQL
Таблица users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
Таблица places
CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,

    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,

    category_slug VARCHAR(100) NOT NULL,
    type_slug VARCHAR(100) NULL,

    short_description TEXT,
    description TEXT,
    full_description TEXT,

    locality VARCHAR(255),
    address TEXT,

    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,

    price VARCHAR(100),
    area VARCHAR(100),
    land_area VARCHAR(100),

    status ENUM('draft', 'pending', 'published', 'rejected') DEFAULT 'pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
Таблица place_images
CREATE TABLE place_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place_id INT NOT NULL,

    path VARCHAR(500) NOT NULL,
    type ENUM('hero', 'gallery', 'thumb') DEFAULT 'gallery',
    sort_order INT DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);
Таблица place_tags
CREATE TABLE place_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place_id INT NOT NULL,
    tag VARCHAR(100) NOT NULL,

    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);
Таблица place_extra_fields
CREATE TABLE place_extra_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place_id INT NOT NULL,

    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,

    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);
Таблица favorites
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    place_id INT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_favorite (user_id, place_id),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);
Таблица conversations
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    place_id INT NOT NULL,
    author_id INT NOT NULL,
    visitor_id INT NULL,

    visitor_name VARCHAR(255),
    visitor_contact VARCHAR(255),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (visitor_id) REFERENCES users(id) ON DELETE SET NULL
);
Таблица messages
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,

    conversation_id INT NOT NULL,
    sender_id INT NULL,

    sender_type ENUM('visitor', 'author', 'system') DEFAULT 'visitor',

    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);
Связи
users 1 → many places
places 1 → many place_images
places 1 → many place_tags
places 1 → many place_extra_fields
users many → many places через favorites
places 1 → many conversations
conversations 1 → many messages
Почему extra_fields отдельной таблицей

У разных категорий разные поля.

Не нужно раздувать таблицу places колонками:

fish
season
organizer
parking
rooms
food
permission

Лучше хранить гибко:

field_key
field_value

Это проще расширять.

Статусы объекта
draft      — черновик
pending    — ожидает модерации
published  — опубликован
rejected   — отклонён
Статусы пользователя
user       — обычный пользователь
moderator  — модератор
admin      — администратор