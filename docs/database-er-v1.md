# Native Places — ER-схема базы данных v1

## Главная логика

Одна база данных:

```txt
vnuko1796_nativeplaces_dev
```

Внутри базы — таблицы проекта.

---

# 1. Пользователи и роли

## roles → users

Одна роль может быть у многих пользователей.

```txt
roles.id
  ↓
users.role_id
```

Роли:

```txt
user
moderator
admin
```

---

# 2. Пользователи и объявления

## users → places

Один пользователь может создать много объектов.

```txt
users.id
  ↓
places.user_id
```

Пример:

```txt
Риэлтор
├── Дом на продажу
├── Участок
└── Квартира
```

---

# 3. Категории и подтипы

## categories → place_types

Одна категория содержит много подтипов.

```txt
categories.id
  ↓
place_types.category_id
```

Категории:

```txt
real_estate  — Недвижимость
rent         — Аренда
recreation   — Базы отдыха
fishing      — Рыбалка
hunting      — Охота
nature       — Природа
```

---

## categories → places

Каждый объект относится к одной категории.

```txt
categories.id
  ↓
places.category_id
```

---

## place_types → places

Каждый объект может иметь один подтип.

```txt
place_types.id
  ↓
places.place_type_id
```

Пример:

```txt
Недвижимость
├── Дом
├── Квартира
├── Участок
└── Коммерческий объект
```

---

# 4. Объекты

## places

Главная таблица проекта.

В ней хранятся:

```txt
недвижимость
аренда
базы отдыха
рыбалка
охота
природа
```

Объект имеет:

```txt
автора
категорию
подтип
координаты
статус модерации
тип публикации
срок публикации
контакты
```

---

# 5. Фото объектов

## places → place_images

Один объект может иметь много фотографий.

```txt
places.id
  ↓
place_images.place_id
```

Пример:

```txt
Дом на продажу
├── cover.jpg
├── kitchen.jpg
├── yard.jpg
└── river-nearby.jpg
```

---

# 6. Дополнительные свойства

## places → place_attributes

Один объект может иметь много дополнительных параметров.

```txt
places.id
  ↓
place_attributes.place_id
```

Примеры:

Недвижимость:

```txt
area = 120
rooms = 4
land_area = 15 соток
```

Рыбалка:

```txt
fish_types = сазан, щука, карась
is_paid = 1
price = 1000
```

Охота:

```txt
hunt_types = утка, кабан
season = осень
guide_available = 1
```

База отдыха:

```txt
parking = 1
food = 1
bathhouse = 1
```

---

# 7. Тарифы и подписки

## plans → user_subscriptions

Один тариф может быть у многих подписок.

```txt
plans.id
  ↓
user_subscriptions.plan_id
```

---

## users → user_subscriptions

Один пользователь может иметь историю подписок.

```txt
users.id
  ↓
user_subscriptions.user_id
```

Примеры тарифов:

```txt
free
private
realtor
business
```

---

# 8. Платежи

## users → payments

Один пользователь может иметь много платежей.

```txt
users.id
  ↓
payments.user_id
```

---

## places → payments

Платёж может быть связан с конкретным объектом.

```txt
places.id
  ↓
payments.place_id
```

---

## user_subscriptions → payments

Платёж может быть связан с тарифом или подпиской.

```txt
user_subscriptions.id
  ↓
payments.subscription_id
```

---

# 9. Избранное

## users → favorites

Один пользователь может добавить много объектов в избранное.

```txt
users.id
  ↓
favorites.user_id
```

---

## places → favorites

Один объект может быть в избранном у многих пользователей.

```txt
places.id
  ↓
favorites.place_id
```

---

# 10. Маршруты

## users → routes

Один пользователь может создать много маршрутов.

```txt
users.id
  ↓
routes.user_id
```

---

## routes → route_places

Один маршрут содержит много объектов.

```txt
routes.id
  ↓
route_places.route_id
```

---

## places → route_places

Один объект может входить в разные маршруты.

```txt
places.id
  ↓
route_places.place_id
```

---

# 11. Уведомления

## users → notifications

Один пользователь может получить много уведомлений.

```txt
users.id
  ↓
notifications.user_id
```

Типы уведомлений:

```txt
place_published
place_rejected
place_expiring
place_expired
payment_success
payment_failed
new_message
new_review
report_created
```

---

# 12. Чат

## conversations

Диалог между пользователями по объекту.

---

## users → conversations

В диалоге есть два участника:

```txt
conversations.buyer_id
conversations.owner_id
```

Оба поля связаны с:

```txt
users.id
```

---

## places → conversations

Диалог может быть связан с объектом.

```txt
places.id
  ↓
conversations.place_id
```

---

## conversations → messages

Один диалог содержит много сообщений.

```txt
conversations.id
  ↓
messages.conversation_id
```

---

## users → messages

Каждое сообщение имеет автора.

```txt
users.id
  ↓
messages.sender_id
```

---

# 13. Отзывы

## users → reviews

Один пользователь может оставить много отзывов.

```txt
users.id
  ↓
reviews.user_id
```

---

## places → reviews

Один объект может иметь много отзывов.

```txt
places.id
  ↓
reviews.place_id
```

Отзывы проходят модерацию.

Статусы:

```txt
pending
published
rejected
```

Рейтинг пока не используем.

---

# 14. Жалобы

## users → reports

Один пользователь может отправить много жалоб.

```txt
users.id
  ↓
reports.user_id
```

---

## places → reports

Один объект может иметь много жалоб.

```txt
places.id
  ↓
reports.place_id
```

Типы жалоб:

```txt
outdated
fake
wrong_info
forbidden
spam
other
```

Статусы:

```txt
new
in_progress
resolved
rejected
```

---

# 15. Основная схема связей

```txt
roles
└── users
    ├── places
    │   ├── place_images
    │   ├── place_attributes
    │   ├── favorites
    │   ├── route_places
    │   ├── conversations
    │   ├── reviews
    │   ├── reports
    │   └── payments
    │
    ├── user_subscriptions
    │   └── payments
    │
    ├── favorites
    ├── routes
    │   └── route_places
    │
    ├── notifications
    ├── conversations
    ├── messages
    ├── reviews
    └── reports


categories
├── place_types
└── places


plans
└── user_subscriptions
```

---

# 16. Правила публикации

## Бесплатная публикация

```txt
Создание объекта
↓
status = pending
↓
Модерация
↓
status = published
↓
expires_at = published_at + 14 дней
↓
Уведомление перед окончанием
↓
Если не продлено:
status = expired
```

---

## Платная публикация

```txt
Создание объекта
↓
Оплата
↓
Модерация
↓
status = published
↓
expires_at = дата окончания оплаченного периода
↓
Продление через оплату
```

---

## Природа

Категорию "Природа" добавляют только:

```txt
admin
moderator
```

---

## Рыбалка

Рыбалка может быть:

```txt
бесплатное место
платный пруд
рыболовная база
```

Для этого у объекта используется признак:

```txt
is_commercial
```

---

## Охота

В категории "Охота" размещаются:

```txt
охотхозяйства
егеря
организаторы туров
```

---

# 17. Бронирование

Отдельной системы бронирования в v1 нет.

В объекте будет способ связи:

```txt
booking_type
```

Варианты:

```txt
chat      — списаться внутри сайта
phone     — позвонить
external  — перейти на внешний сайт
```

Если используется внешний сайт:

```txt
booking_url
```

---
