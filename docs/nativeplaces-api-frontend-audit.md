# Native Places — сверка frontend ↔ API ↔ БД

Дата проверки: 06.06.2026  
Архив: `nativeplaces-main(1).zip`  
Файл API с хоста: `api(9).docx`

---

## 1. Что проверено

Проверены:

- папка `docs` в архиве;
- структура React/Vite проекта;
- API-клиенты frontend в `src/shared/api`;
- страницы и разделы кабинета, которые уже обращаются к API;
- SQL-структура БД в `database/database-v1.sql`;
- PHP endpoint-ы из файла `api(9).docx`;
- сборка проекта через `npm run build`;
- проверка ESLint через `npm run lint`.

---

## 2. Проверка работоспособности архива

### Результат

Проект frontend собирается.

Команды:

```bash
npm ci
npm run build
npm run lint
```

Результат:

- `npm ci` — успешно;
- `npm run build` — успешно;
- `npm run lint` — успешно, ошибок ESLint нет.

### Предупреждения сборки

#### 1. Не найден фон авторизации

Vite предупреждает:

```txt
/images/auth/rostov-map-bg.jpg referenced in /images/auth/rostov-map-bg.jpg didn't resolve at build time
```

Используется в:

```txt
src/pages/AuthPage.css
```

Но файла в архиве нет:

```txt
public/images/auth/rostov-map-bg.jpg
```

Что будет на сайте:

- страница входа/регистрации будет работать;
- фон карты на странице авторизации может не отображаться.

Что сделать:

```txt
public/images/auth/rostov-map-bg.jpg
```

или заменить путь в CSS на существующую картинку.

#### 2. JS chunk больше 500 KB

Это не ошибка, а предупреждение Vite:

```txt
Some chunks are larger than 500 kB after minification
```

Сейчас можно оставить. Позже можно разделить код через dynamic import.

---

## 3. Общий вывод по стадии проекта

По документам проект уже прошёл demo/localStorage-этап и частично подключен к backend.

Сейчас реально подключены к API:

- авторизация;
- профиль;
- карта объектов;
- страница объекта;
- избранное;
- мои места;
- создание объявления;
- маршруты;
- публичные маршруты;
- аватар профиля.

Ещё не полностью подключены к backend:

- сообщения в кабинете — всё ещё localStorage;
- обращения/жалобы/предложения — localStorage;
- динамические поля объявления — UI есть, в API пока не отправляются;
- загрузка фото объявления — UI есть, endpoint есть, но frontend его не использует;
- редактирование объявления через форму `/submit?edit=...` — пока заглушка;
- удаление объявлений фактически архивирует объект через статус `expired`.

---

# 4. Главные расхождения

## 4.1. Критично: `real_estate` в БД/API и `real-estate` во frontend

### В БД/API

Категория недвижимости имеет код:

```txt
real_estate
```

### Во frontend

В статических категориях карты и формы используется:

```txt
real-estate
```

### Где уже частично исправлено

В `placesApi.js`, `favoritesApi.js`, `routesApi.js` есть нормализация:

```js
real_estate -> real-estate
```

### Где проблема остаётся

В `myPlacesApi.js` нормализации нет:

```js
categorySlug: place.category_code || ""
```

Значит в “Мои места” объект недвижимости может иметь `categorySlug: "real_estate"`, а остальной frontend ждёт `real-estate`.

### Отдельная проблема в SubmitPage

`SubmitPage` загружает категории с backend и кладёт:

```js
selectedCategory = category.code
```

Для недвижимости это будет:

```txt
real_estate
```

А динамические поля берутся так:

```js
getFieldsByCategory(selectedCategory)
```

Но `categoryFields` содержит ключ:

```txt
real-estate
```

Итог: для недвижимости динамические поля в форме подачи объявления не покажутся.

### Что исправить

Лучше выбрать единый формат.

Рекомендую на frontend везде использовать backend-код `real_estate`, а старые статические ключи привести к нему. Это проще, потому что БД/API уже работают с `real_estate`.

Или оставить frontend-формат `real-estate`, но тогда везде нужна нормализация:

```js
function normalizeCategoryCode(code) {
    return code === "real_estate" ? "real-estate" : code || "";
}
```

И применить её минимум в:

```txt
src/shared/api/myPlacesApi.js
src/pages/SubmitPage.jsx
src/data/submit/categoryFields.js / category lookup
```

---

## 4.2. Критично: динамические поля объявления не сохраняются

### Во frontend

В `SubmitPage.jsx` есть `extraFields`:

```js
price
area
landArea
rooms
season
fish
access
format
rules
permission
organizer
accommodation
capacity
food
parking
```

Поля отображаются по категории.

### В API/БД

В БД есть:

```txt
attribute_definitions
place_attributes
reference_groups
reference_values
```

Есть endpoint:

```txt
/api/place-attributes/definitions.php?category_id=...
```

### Расхождение

Frontend не отправляет `extraFields` в API при создании/обновлении объявления.

Сейчас при подаче объявления сохраняются только:

```txt
title
category_id
place_type_id
short_description
full_description
address
latitude
longitude
contact_name
phone
telegram
email
website
booking_type
booking_url
```

Данные вроде цены, площади, сезона рыбалки, видов рыбы, условий охоты и т.д. теряются.

### Что сделать

Нужен один из вариантов:

#### Вариант А — простой временный

Добавить в `places` отдельные колонки для самых важных полей.

Не рекомендую, потому что категории разные.

#### Вариант Б — правильный

Добавить API для сохранения атрибутов:

```txt
POST /api/place-attributes/save.php
```

Тело:

```json
{
  "place_id": 1,
  "attributes": {
    "price": "7500000",
    "area": "100",
    "rooms": "5"
  }
}
```

И после `myPlacesApi.updateMyPlace()` отправлять `extraFields` отдельным запросом.

---

## 4.3. Критично: фото объявления выбираются в форме, но не загружаются на backend

### Во frontend

`SubmitPage.jsx` читает выбранные изображения как base64:

```js
gallery
```

Используется только для предпросмотра.

### В API

На backend есть endpoint-ы:

```txt
/api/place-images/upload.php
/api/place-images/index.php
/api/place-images/delete.php
/api/place-images/set-cover.php
```

### Расхождение

Frontend не вызывает `/place-images/upload.php`.

Итог:

- пользователь выбирает фото;
- видит предпросмотр;
- объект создаётся;
- фото на сервер не уходят;
- `cover_image` не появляется, если фото не было отдельно загружено.

### Что сделать

Добавить API-клиент:

```txt
src/shared/api/placeImagesApi.js
```

Метод:

```js
uploadPlaceImage(placeId, file)
```

И в `SubmitPage.jsx` хранить не только base64, но и исходные `File`, чтобы после создания объекта отправить их на backend.

---

## 4.4. Важное: карта грузит все места один раз и фильтрует локально

### API умеет фильтровать

`/api/places/map.php` принимает:

```txt
category
type
commercial
booking
q
```

### Frontend сейчас

`MapPage.jsx` вызывает:

```js
placesApi.getMapPlaces()
```

без параметров.

Дальше фильтрует локально:

```js
filterPlaces(allPlaces, { category, search })
```

### Это не баг сейчас

Для маленького каталога работает нормально.

### Ограничение

Когда объектов станет много, карта будет грузить всё сразу. Также frontend сейчас не использует backend-фильтры:

```txt
type
commercial
booking
```

### Что сделать позже

Передавать параметры в API:

```js
placesApi.getMapPlaces({
  category,
  q: search,
  type,
  commercial,
  booking,
})
```

Но перед этим надо решить `real_estate` / `real-estate`.

---

## 4.5. Важное: сообщения в кабинете ещё не подключены к API

### В API есть

```txt
/api/conversations/index.php
/api/conversations/start.php
/api/messages/index.php
/api/messages/send.php
```

### Во frontend есть API-клиента нет

Сейчас `AccountMessagesSection.jsx` использует:

```txt
src/shared/storage/messagesStorage.js
```

То есть localStorage.

### Итог

Backend сообщений есть, но кабинет его не использует.

### Что сделать

Добавить:

```txt
src/shared/api/messagesApi.js
```

Методы:

```js
getConversations()
startConversation(placeId)
getMessages(conversationId)
sendMessage(conversationId, messageText)
```

И заменить localStorage в `AccountMessagesSection.jsx`.

---

## 4.6. Важное: обращения, жалобы и предложения ещё localStorage

### Во frontend

`AccountSettingsSection.jsx` использует:

```txt
src/shared/storage/supportStorage.js
```

### В API с хоста

В docx есть endpoint-ы для `reports` и `reviews`, но frontend их не использует.

### Итог

Обращения в поддержку, предложения и жалобы пока сохраняются только в браузере пользователя.

### Что сделать

Нужны endpoint-ы под support-заявки или использовать таблицу `reports`, если логика подходит.

---

# 5. Сверка по разделам

---

## 5.1. Авторизация

### Frontend endpoint-ы

```txt
GET  /api/auth/me.php
POST /api/auth/login.php
POST /api/auth/register.php
POST /api/auth/logout.php
```

### Register — frontend отправляет

```json
{
  "email": "...",
  "password": "...",
  "first_name": "...",
  "profile_status": null,
  "phone": null,
  "telegram": null
}
```

### Register — API принимает

```txt
email
password
first_name
profile_status
phone
telegram
```

### Register — API возвращает

```txt
message
user.id
user.role_id
user.email
user.first_name
user.profile_status
user.phone
user.telegram
user.status
```

### Frontend использует

После регистрации frontend сразу делает login. Из ответа регистрации почти ничего не используется, кроме успешности запроса.

### Login — frontend отправляет

```json
{
  "email": "...",
  "password": "..."
}
```

### Login — API возвращает

```txt
message
authenticated
user.id
user.role_id
user.email
user.first_name
user.last_name
user.phone
user.telegram
user.avatar
user.status
user.role_code
user.role_title
```

### Frontend использует

```txt
authenticated
user
user.first_name
user.profile_status
user.phone
user.telegram
user.avatar
```

### Расхождение

`login.php` не возвращает `profile_status`, а `me.php` и `profile/index.php` возвращают.

Возможный эффект:

- после входа статус профиля может быть пустой до перезагрузки/обновления через `me.php`;
- в кабинете будет дефолтный статус `Дневник родных мест`.

### Исправление

Добавить в `api/auth/login.php` поле:

```sql
u.profile_status
```

---

## 5.2. Профиль и настройки

### Frontend endpoint-ы

```txt
GET  /api/profile/index.php
POST /api/profile/update.php
POST /api/profile/avatar.php
```

### Profile index — API возвращает

```txt
user.id
user.email
user.first_name
user.profile_status
user.phone
user.telegram
user.avatar
user.status
user.created_at
user.role_code
user.role_title
```

### Frontend использует

```txt
first_name
profile_status
phone
telegram
avatar
```

### Update — frontend отправляет

```json
{
  "first_name": "...",
  "profile_status": "...",
  "phone": "...",
  "telegram": "..."
}
```

### Update — API принимает

```txt
first_name
profile_status
phone
telegram
```

### Update — API возвращает

```txt
message
profile.first_name
profile.profile_status
profile.phone
profile.telegram
```

### Frontend использует

```txt
profile.first_name
profile.profile_status
profile.phone
profile.telegram
```

### Avatar — frontend отправляет

```txt
FormData: avatar
```

### Avatar — API возвращает

```txt
message
avatar
```

### Frontend использует

```txt
avatar
```

### Расхождения

Критичных нет.

Есть мелочь: в `AccountSettingsSection.jsx` остались debug-логи:

```txt
AVATAR_STEP_1
AVATAR_STEP_2
AVATAR_STEP_3
AVATAR_UPLOAD_ERROR
```

Перед финальной выкладкой лучше убрать.

---

## 5.3. Карта объектов

### Frontend endpoint

```txt
GET /api/places/map.php
```

### API принимает фильтры

```txt
category
type
commercial
booking
q
```

### Frontend сейчас отправляет

```txt
ничего
```

### API возвращает

```txt
places[].id
places[].title
places[].slug
places[].latitude
places[].longitude
places[].cover_image
places[].category_code
places[].category_title
places[].category_icon
places[].category_color
places[].type_code
places[].type_title
filters.category
filters.type
filters.commercial
filters.booking
filters.q
```

### Frontend использует

```txt
id
slug
title
latitude
longitude
cover_image
category_code
category_title
category_icon
category_color
type_code
type_title
```

### Frontend не использует

```txt
filters
```

### Расхождения

1. API умеет фильтровать, frontend фильтрует локально.
2. Для недвижимости нужна нормализация `real_estate -> real-estate`.
3. Если `latitude` или `longitude` равны `0`, frontend считает координаты отсутствующими из-за проверки:

```js
place.latitude && place.longitude
```

Для России это не критично, но технически правильнее:

```js
place.latitude !== null && place.longitude !== null
```

---

## 5.4. Страница объекта

### Frontend endpoint

```txt
GET /api/places/show.php?slug=...
```

### API возвращает

```txt
place.id
place.title
place.slug
place.short_description
place.full_description
place.cover_image
place.address
place.latitude
place.longitude
place.contact_name
place.phone
place.telegram
place.email
place.website
place.status
place.publication_type
place.is_commercial
place.booking_type
place.booking_url
place.created_at
place.category_code
place.category_title
place.category_icon
place.category_color
place.type_code
place.type_title
images[].id
images[].image_path
images[].sort_order
images[].is_cover
```

### Frontend использует

```txt
id
slug
title
short_description
full_description
cover_image
address
latitude
longitude
contact_name
phone
telegram
email
website
status
publication_type
is_commercial
booking_type
booking_url
created_at
category_code
category_title
category_icon
category_color
type_code
type_title
images[].image_path
```

### Frontend не использует

```txt
images[].id
images[].sort_order
images[].is_cover
```

### Расхождения

Критичных нет.

Но если позже нужна сортировка/управление галереей на frontend, понадобятся `id`, `sort_order`, `is_cover`.

---

## 5.5. Избранное

### Frontend endpoint-ы

```txt
GET  /api/favorites/index.php
GET  /api/favorites/check.php?place_id=...
POST /api/favorites/toggle.php
```

### Favorites index — API возвращает

```txt
favorites[].favorite_id
favorites[].favorite_created_at
favorites[].id
favorites[].title
favorites[].slug
favorites[].short_description
favorites[].cover_image
favorites[].address
favorites[].category_code
favorites[].category_title
favorites[].type_code
favorites[].type_title
```

### Frontend использует

```txt
favorite_id
id
title
slug
short_description
cover_image
address
category_code
category_title
type_code
type_title
```

### Frontend не использует

```txt
favorite_created_at
```

### Toggle — frontend отправляет

```json
{
  "place_id": 1
}
```

### Toggle — API возвращает

```txt
message
place_id
is_favorite
action
```

### Frontend использует

На странице объекта:

```txt
is_favorite
```

В кабинете при удалении из избранного ответ почти не используется, элемент удаляется из state вручную.

### Check — API возвращает

```txt
is_favorite
```

### Frontend использует

```txt
is_favorite
```

### Расхождения

Критичных нет.

---

## 5.6. Подача объявления

### Frontend endpoint-ы

```txt
GET  /api/places/create-options.php
POST /api/my-places/create.php
POST /api/my-places/update.php
```

### Create options — API возвращает

```txt
categories[].id
categories[].code
categories[].title
categories[].description
categories[].icon
categories[].color
categories[].sort_order

types[].id
types[].category_id
types[].code
types[].title
types[].sort_order
types[].category_code
types[].category_title

plans[].id
plans[].code
plans[].title
plans[].description
plans[].max_places
plans[].duration_days
plans[].price

publication_types[].value
publication_types[].title

booking_types[].value
booking_types[].title

commercial_options[].value
commercial_options[].title
```

### Frontend использует

```txt
categories[].id
categories[].code
categories[].title

types[].id
types[].code
types[].title
types[].category_code
```

### Frontend не использует

```txt
categories[].description
categories[].icon
categories[].color
categories[].sort_order
plans
publication_types
booking_types
commercial_options
```

### Create my place — frontend отправляет

```json
{
  "title": "...",
  "category_id": 1,
  "place_type_id": 1
}
```

### Create my place — API принимает

```txt
title
category_id
place_type_id
```

### Create my place — API возвращает

```txt
message
place_id
slug
status
```

### Frontend использует

```txt
place_id
```

### Update my place — frontend отправляет

```json
{
  "id": 1,
  "title": "...",
  "short_description": "...",
  "full_description": "...",
  "address": "...",
  "latitude": 49.0,
  "longitude": 41.0,
  "contact_name": "...",
  "phone": "...",
  "telegram": "...",
  "email": "...",
  "website": "",
  "booking_type": "phone",
  "booking_url": ""
}
```

### Update my place — API принимает

```txt
id
title
short_description
full_description
address
latitude
longitude
contact_name
phone
telegram
email
website
booking_type
booking_url
```

### Update my place — API возвращает

```txt
message
place_id
```

### Frontend использует

Ответ почти не используется. После успешного запроса переход:

```txt
/account
```

### Расхождения

1. Не сохраняются динамические поля `extraFields`.
2. Не загружаются фото.
3. Не используются тарифы `plans`.
4. Не используются `publication_types`.
5. Не используется выбор `booking_type`; frontend всегда ставит:

```txt
phone
```

6. Не используется `commercial_options`; frontend не отправляет `is_commercial`.
7. `create.php` временно ставит координаты `0, 0`, потом `update.php` перезаписывает. Лучше создать объект сразу со всеми основными данными одним endpoint-ом.
8. Редактирование существующего объявления через `/submit?edit=...` не подключено.

---

## 5.7. Мои места

### Frontend endpoint

```txt
GET /api/my-places/index.php
```

### API возвращает

```txt
places[].id
places[].title
places[].slug
places[].short_description
places[].cover_image
places[].address
places[].latitude
places[].longitude
places[].status
places[].publication_type
places[].is_commercial
places[].booking_type
places[].created_at
places[].updated_at
places[].category_code
places[].category_title
places[].type_code
places[].type_title
```

### Frontend использует

```txt
id
title
slug
short_description
cover_image
address
latitude
longitude
status
publication_type
is_commercial
booking_type
created_at
updated_at
category_code
category_title
type_code
type_title
```

### Расхождения

1. Нет нормализации `real_estate -> real-estate`.
2. Не приходят `full_description`, контакты, `booking_url`, `website`. Для списка это нормально, но для полноценного редактирования будет мало.
3. Удаление из “Мои места” вызывает архивирование:

```txt
status = expired
```

Это нормальная мягкая логика, но в UI лучше писать “В архив”, а не “Удалить”, чтобы пользователь понимал.

---

## 5.8. Архив объявлений

### Frontend endpoint

```txt
GET /api/my-places/index.php
```

### Frontend логика

```js
places.filter((place) => place.status === "expired")
```

### API возвращает

Те же поля, что в “Мои места”.

### Расхождения

1. Архив объявлений завязан только на `expired`.
2. В БД есть также статусы:

```txt
archived
closed
rejected
```

Но frontend их в архив не относит.

### Что решить

Определить точную бизнес-логику:

- `expired` — срок закончился;
- `archived` — пользователь сам убрал;
- `closed` — сделка/объект закрыт;
- `rejected` — модерация отклонила.

Сейчас кнопка удаления ставит именно `expired`.

---

## 5.9. Маршруты

### Frontend endpoint-ы

```txt
GET  /api/routes/index.php
POST /api/routes/create.php
GET  /api/routes/show.php?route_id=...
POST /api/routes/update.php
POST /api/routes/delete.php
POST /api/routes/add-place.php
POST /api/routes/remove-place.php
POST /api/routes/reorder.php
GET  /api/routes/share.php?token=...
```

### Routes index — API возвращает

```txt
routes[].id
routes[].title
routes[].description
routes[].is_public
routes[].share_token
routes[].created_at
routes[].updated_at
routes[].places_count
```

### Frontend использует

```txt
id
title
description
is_public
share_token
created_at
updated_at
places_count
```

### Create route — frontend отправляет

```json
{
  "title": "...",
  "description": "...",
  "is_public": false
}
```

### Create route — API возвращает

```txt
message
route.id
route.title
route.description
route.is_public
route.share_token
```

### Frontend использует

```txt
route.id
route.title
route.description
route.is_public
route.share_token
```

### Show/share route — API возвращает маршрут

```txt
route.id
route.user_id
route.title
route.description
route.is_public
route.share_token
route.created_at
route.updated_at
```

### Show/share route — API возвращает места

```txt
places[].route_place_id
places[].sort_order
places[].note
places[].id
places[].title
places[].slug
places[].short_description
places[].cover_image
places[].address
places[].latitude
places[].longitude
places[].status
places[].category_code
places[].category_title
places[].category_icon
places[].category_color
places[].type_code
places[].type_title
```

### Frontend использует

```txt
route.id
route.title
route.description
route.is_public
route.share_token
route.created_at
route.updated_at
places[].route_place_id
places[].sort_order
places[].note
places[].id
places[].title
places[].slug
places[].short_description
places[].cover_image
places[].address
places[].latitude
places[].longitude
places[].status
places[].category_code
places[].category_title
places[].type_code
places[].type_title
```

### Frontend не использует

```txt
route.user_id
places[].category_icon
places[].category_color
```

### Расхождения

Критичных нет.

Но есть бизнес-расхождение: в документах кабинета есть “архив маршрутов”, а API `routes/delete.php` физически удаляет маршрут и точки из `route_places`. Если нужен архив маршрутов на backend, надо добавить статус маршрута:

```txt
active
archived
```

Сейчас архив маршрутов во frontend частично localStorage.

---

## 5.10. Добавление объекта в маршрут

### Frontend endpoint

```txt
POST /api/routes/add-place.php
```

### Frontend отправляет

```json
{
  "route_id": 1,
  "place_id": 2,
  "note": ""
}
```

### API принимает

```txt
route_id
place_id
note
```

### API возвращает

```txt
message
route_id
place_id
sort_order
```

### Frontend использует

Ответ не используется, важен только успешный статус.

### Расхождения

Критичных нет.

---

## 5.11. Публичный маршрут

### Frontend route

```txt
/routes/share/:token
```

### API endpoint

```txt
GET /api/routes/share.php?token=...
```

### API возвращает

```txt
route
places
```

Только если:

```txt
is_public = 1
```

### Frontend использует

```txt
route.title
route.description
places
```

### Расхождения

Критичных нет.

Важно проверить на хостинге rewrite-настройки для SPA, чтобы прямой переход на:

```txt
https://native-places.ru/routes/share/{token}
```

не давал 404 от сервера.

---

# 6. Что приходит из API, но frontend пока не использует

## Категории / create-options

```txt
categories.description
categories.icon
categories.color
categories.sort_order
```

Можно использовать для красивой формы подачи объявления.

## Тарифы

```txt
plans
```

Сейчас приходят, но не участвуют в подаче объявления.

## Тип публикации

```txt
publication_types
```

Сейчас приходят, но frontend всегда создаёт бесплатное объявление через backend default.

## Тип бронирования

```txt
booking_types
```

Сейчас приходят, но frontend всегда отправляет:

```txt
booking_type = phone
```

## Коммерческий объект

```txt
commercial_options
```

Сейчас приходят, но frontend не даёт выбрать и не отправляет `is_commercial`.

## Галерея объекта

```txt
images[].id
images[].sort_order
images[].is_cover
```

На публичной странице объекта не нужны, но понадобятся для редактирования фото.

---

# 7. Что frontend использует, но API/сохранение пока не покрывает полностью

## Подача объявления

Frontend использует UI-поля:

```txt
extraFields
```

Но API их не сохраняет.

## Фото объявления

Frontend использует:

```txt
gallery preview
```

Но API upload не вызывается.

## Сообщения

Frontend использует localStorage-структуру диалогов, но backend API уже есть.

## Обращения

Frontend использует localStorage-структуру обращений, но backend API под кабинет не подключён.

## Архив маршрутов

Frontend имеет архивную логику, но backend маршруты удаляет физически.

---

# 8. Рекомендованный порядок исправлений

## Шаг 1. Привести category code к одному формату

Самое важное расхождение:

```txt
real_estate vs real-estate
```

Без этого будут мелкие баги в фильтрах, форме и кабинете.

## Шаг 2. Подключить фото объявлений

Потому что endpoint уже есть:

```txt
/api/place-images/upload.php
```

Нужно только добавить frontend API-клиент и отправку файлов после создания объекта.

## Шаг 3. Сохранить динамические поля

Сейчас пользователь может заполнить поля, но они теряются. Это критично для категорий:

- недвижимость;
- аренда;
- рыбалка;
- охота;
- базы отдыха.

## Шаг 4. Доработать `my-places/index.php` для редактирования

Для редактирования объявления нужно получать полную карточку своего объекта, включая:

```txt
full_description
contact_name
phone
telegram
email
website
booking_url
images
attributes
```

Лучше добавить отдельный endpoint:

```txt
GET /api/my-places/show.php?id=...
```

## Шаг 5. Подключить сообщения к API

Backend уже есть, надо заменить localStorage.

## Шаг 6. Решить архив маршрутов

Если архив маршрутов нужен как реальная функция, добавить в БД поле:

```txt
routes.status
```

И не удалять маршрут физически.

---

# 9. Короткий список конкретных багов/рисков

1. Нет файла:

```txt
public/images/auth/rostov-map-bg.jpg
```

2. `login.php` не возвращает `profile_status`.

3. `myPlacesApi.js` не нормализует `real_estate`.

4. `SubmitPage.jsx` не покажет динамические поля для недвижимости из-за `real_estate` / `real-estate`.

5. `SubmitPage.jsx` не сохраняет `extraFields`.

6. `SubmitPage.jsx` не загружает фото на backend.

7. `SubmitPage.jsx` всегда отправляет:

```txt
booking_type = phone
```

8. `SubmitPage.jsx` не отправляет `is_commercial`.

9. Сообщения в кабинете остаются localStorage, хотя API уже есть.

10. Обращения/жалобы/предложения остаются localStorage.

11. Архив маршрутов не backend-архив: API удаляет маршруты физически.

12. На карте frontend не использует backend-фильтры `type`, `commercial`, `booking`, `q`.

---

# 10. Итог

Проект в архиве рабочий: сборка проходит, ESLint ошибок не показывает.

Главная проблема не в запуске, а в неполном соединении frontend с backend. Базовые API уже подключены, но форма подачи объявления пока сохраняет только основную часть объекта. Самые важные недостающие части:

```txt
фото
динамические поля
коммерческий/частный тип
тип бронирования
полноценное редактирование
сообщения через API
```

Первым исправлением лучше сделать единый формат категорий, потому что это влияет сразу на карту, кабинет и подачу объявления.
