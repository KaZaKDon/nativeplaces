-- Native Places Seeds v1
-- Database: vnuko1796_nativeplaces_dev
-- Charset: utf8mb4

SET NAMES utf8mb4;

-- ----------------------------
-- plans
-- ----------------------------

INSERT INTO plans
(code, title, description, max_places, duration_days, price, is_active)
VALUES
(
    'free',
    'Бесплатный',
    '1 объект на 14 дней без платного продвижения.',
    1,
    14,
    0.00,
    1
),
(
    'single_paid',
    'Платное объявление',
    '1 объект на 14 дней с платным размещением.',
    1,
    14,
    0.00,
    1
),
(
    'private',
    'Частный',
    'До 5 активных объектов на 30 дней.',
    5,
    30,
    0.00,
    1
),
(
    'realtor_10',
    'Риэлтор 10',
    'До 10 активных объектов на 30 дней.',
    10,
    30,
    0.00,
    1
),
(
    'realtor_30',
    'Риэлтор 30',
    'До 30 активных объектов на 30 дней.',
    30,
    30,
    0.00,
    1
),
(
    'business',
    'Бизнес',
    'До 100 активных объектов на 30 дней.',
    100,
    30,
    0.00,
    1
);

-- ----------------------------
-- service_features
-- ----------------------------

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT
    rg.id,
    'wifi',
    'Wi-Fi',
    10
FROM reference_groups rg
WHERE rg.code = 'service_features';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'parking', 'Парковка', 20
FROM reference_groups rg
WHERE rg.code = 'service_features';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'bathhouse', 'Баня', 30
FROM reference_groups rg
WHERE rg.code = 'service_features';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'bbq', 'Мангал', 40
FROM reference_groups rg
WHERE rg.code = 'service_features';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'food', 'Питание', 50
FROM reference_groups rg
WHERE rg.code = 'service_features';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'boat_rental', 'Прокат лодок', 60
FROM reference_groups rg
WHERE rg.code = 'service_features';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'quad_rental', 'Прокат квадроциклов', 70
FROM reference_groups rg
WHERE rg.code = 'service_features';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'playground', 'Детская площадка', 80
FROM reference_groups rg
WHERE rg.code = 'service_features';

-- ----------------------------
-- fish_species
-- ----------------------------

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'pike', 'Щука', 10
FROM reference_groups rg
WHERE rg.code = 'fish_species';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'carp', 'Сазан', 20
FROM reference_groups rg
WHERE rg.code = 'fish_species';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'crucian', 'Карась', 30
FROM reference_groups rg
WHERE rg.code = 'fish_species';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'catfish', 'Сом', 40
FROM reference_groups rg
WHERE rg.code = 'fish_species';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'zander', 'Судак', 50
FROM reference_groups rg
WHERE rg.code = 'fish_species';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'perch', 'Окунь', 60
FROM reference_groups rg
WHERE rg.code = 'fish_species';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'grass_carp', 'Белый амур', 70
FROM reference_groups rg
WHERE rg.code = 'fish_species';

INSERT INTO reference_values
(group_id, code, title, sort_order)
SELECT rg.id, 'silver_carp', 'Толстолобик', 80
FROM reference_groups rg
WHERE rg.code = 'fish_species';