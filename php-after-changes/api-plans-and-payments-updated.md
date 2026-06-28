# api/plans и будущий api/payments — исправленный PHP код и фиксация статуса

Дата: 2026-06-28

## Что сейчас есть

По хосту видно:

- папка `api/plans/` есть;
- папки `api/payments/` нет;
- таблица `plans` есть;
- таблица `payments` есть;
- таблица `user_subscriptions` есть.

Поэтому сейчас исправляем только существующий `api/plans/index.php`, а платежные endpoint-ы не считаем готовыми. Их нужно будет создавать отдельно.

---

## `api/plans/index.php`

```php
<?php

require_once __DIR__ . '/../shared/cors.php';
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDatabaseConnection();

    $stmt = $pdo->query("
        SELECT
            id,
            code,
            title,
            description,
            max_places,
            duration_days,
            price,
            is_active
        FROM plans
        WHERE is_active = 1
        ORDER BY price ASC, id ASC
    ");

    successResponse([
        'plans' => $stmt->fetchAll(),
    ]);
} catch (Throwable $e) {
    errorResponse('Не удалось получить тарифы', 500, [
        'error' => $e->getMessage(),
    ]);
}
```

---

## Что нельзя считать готовым

На хосте сейчас нет папки:

```txt
api/payments/
```

Значит этих файлов пока нет и их нельзя просто править:

```txt
api/payments/create.php
api/payments/status.php
api/payments/yookassa-webhook.php
```

Их нужно будет создавать с нуля после того, как будет утверждён сценарий оплаты.

---

## Что видно по таблице `payments`

По скрину структура такая:

```txt
id
user_id
subscription_id
amount
currency
payment_provider
provider_payment_id
status
paid_at
created_at
updated_at
```

Статусы платежа:

```txt
pending
paid
failed
refunded
```

Эта таблица подходит для хранения платежей Ю-Кассы, потому что есть:

```txt
payment_provider
provider_payment_id
status
paid_at
```

---

## Что видно по таблице `user_subscriptions`

По скрину структура такая:

```txt
id
user_id
plan_id
source
status
starts_at
expires_at
created_at
updated_at
```

Статусы подписки:

```txt
active
expired
cancelled
```

Эта таблица подходит для тарифного доступа пользователя: какой тариф активен, когда начался и когда заканчивается.

---

## Какой сценарий оплаты нужен позже

Когда будем создавать `api/payments/`, минимальная схема такая:

```txt
1. Пользователь выбирает тариф из plans.
2. Backend проверяет активный тариф и лимит max_places.
3. Backend создаёт запись user_subscriptions со статусом active только после успешной оплаты.
4. До оплаты создаётся payment со статусом pending.
5. Ю-Касса возвращает provider_payment_id.
6. Webhook Ю-Кассы меняет payments.status на paid.
7. После paid создаётся/продлевается user_subscriptions.
8. Объявление получает срок expires_at на основании plans.duration_days.
```

---

## Какие PHP-файлы нужно будет создать для Ю-Кассы

Позже нужно будет добавить новую папку:

```txt
api/payments/
```

И минимум три файла:

```txt
api/payments/create.php
api/payments/status.php
api/payments/yookassa-webhook.php
```

Но сейчас их не добавляю как готовый код, потому что не хватает:

```txt
shopId Ю-Кассы
secretKey Ю-Кассы
точного сценария: подписка покупается отдельно или при создании объявления
правил лимита max_places
правил продления active user_subscriptions
```

---

## Утверждённые решения по тарифам

1. Коммерческий тариф с ценой `0 ₽` на период запуска считается коммерческим тарифом: `publication_type = paid`, но `payment_status = not_required`.
2. Тариф выбирается до создания объявления, поэтому `api/my-places/create.php` принимает `plan_id`.
3. Для бесплатных, промо и бессрочных тарифов тоже создаётся запись в `user_subscriptions`, чтобы лимиты считались одинаково.
4. Лимит `plans.max_places` считаем по активным объявлениям пользователя со статусами `pending`, `published`, `rejected`; `expired` в лимит не входит.
5. Тариф на 50 объявлений лучше держать скрытым или выдавать по запросу через админа.
6. Для своих/служебных объявлений можно завести отдельный тариф с `price = 0`, `duration_days = NULL` или `0`, `max_places = 0`; это будет бесплатно и бессрочно.

## Как админ будет управлять тарифами без новой сложной схемы

Текущих полей таблицы `plans` достаточно для первого рабочего варианта:

```txt
max_places      лимит объявлений; 0 можно считать безлимитом
duration_days   срок размещения; NULL или 0 можно считать бессрочно
price           стоимость; 0.00 значит бесплатно
is_active       показывать тариф или нет
```

То есть админ сможет менять срок и стоимость прямо в полях тарифа:

```txt
14 дней / 0 ₽
14 дней / 490 ₽
30 дней / 2990 ₽
0 или NULL дней / 0 ₽ — бесплатно навсегда
365 дней / 0 ₽ — бесплатно на год
```

Для аккуратного UI позже можно добавить `sort_order` и `is_visible`, но базовая логика уже может работать на текущей структуре.
