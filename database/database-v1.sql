-- Native Places Database v1
-- Database: vnuko1796_nativeplaces_dev
-- Charset: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- roles
-- ----------------------------

CREATE TABLE IF NOT EXISTS roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO roles (code, title) VALUES
('user', 'Пользователь'),
('moderator', 'Модератор'),
('admin', 'Администратор');

-- ----------------------------
-- users
-- ----------------------------

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    role_id INT UNSIGNED NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,

    phone VARCHAR(30) NULL,
    telegram VARCHAR(100) NULL,

    avatar VARCHAR(255) NULL,

    is_email_verified TINYINT(1) DEFAULT 0,
    is_phone_verified TINYINT(1) DEFAULT 0,

    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,

    status ENUM(
        'active',
        'blocked',
        'deleted'
    ) DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- categories
-- ----------------------------

CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT NULL,

    icon VARCHAR(50) NULL,
    color VARCHAR(30) NULL,

    sort_order INT UNSIGNED DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (code, title, description, icon, color, sort_order) VALUES
('real_estate', 'Недвижимость', 'Покупка и продажа домов, квартир, участков и коммерческих объектов.', '🏠', '#2563eb', 10),
('rent', 'Аренда', 'Аренда домов, квартир и жилья для временного проживания.', '🔑', '#16a34a', 20),
('recreation', 'Базы отдыха', 'Базы отдыха, кемпинги, гостиницы, гостевые дома и места размещения.', '🏕️', '#ea580c', 30),
('fishing', 'Рыбалка', 'Места ловли, платные пруды, озёра, рыболовные базы и услуги.', '🎣', '#0284c7', 40),
('hunting', 'Охота', 'Охотхозяйства, егеря и организаторы охотничьих туров.', '🦌', '#854d0e', 50),
('nature', 'Природа', 'Заповедники, заказники, природные территории и красивые места.', '🌿', '#15803d', 60);

-- ----------------------------
-- place_types
-- ----------------------------

CREATE TABLE IF NOT EXISTS place_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    category_id INT UNSIGNED NOT NULL,

    code VARCHAR(80) NOT NULL,
    title VARCHAR(120) NOT NULL,

    sort_order INT UNSIGNED DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_place_types_category_code (category_id, code),

    CONSTRAINT fk_place_types_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- place_types seed
-- ----------------------------

INSERT INTO place_types (category_id, code, title, sort_order)
SELECT id, 'house', 'Дом', 10 FROM categories WHERE code = 'real_estate';

INSERT INTO place_types (category_id, code, title, sort_order)
SELECT id, 'apartment', 'Квартира', 20 FROM categories WHERE code = 'real_estate';

INSERT INTO place_types (category_id, code, title, sort_order)
SELECT id, 'land', 'Участок', 30 FROM categories WHERE code = 'real_estate';

INSERT INTO place_types (category_id, code, title, sort_order)
SELECT id, 'commercial', 'Коммерческий объект', 40 FROM categories WHERE code = 'real_estate';


INSERT INTO place_types (category_id, code, title, sort_order)
SELECT id, 'daily_house', 'Дом посуточно', 10 FROM categories WHERE code = 'rent';

INSERT INTO place_types (category_id, code, title, sort_order)
SELECT id, 'daily_apartment', 'Квартира посуточно', 20 FROM categories WHERE code = 'rent';

INSERT INTO place_types (category_id, code, title, sort_order)
SELECT id, 'long_term', 'Долгосрочная аренда', 30 FROM categories WHERE code = 'rent';

-- ----------------------------
-- places
-- ----------------------------

CREATE TABLE IF NOT EXISTS places (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    category_id INT UNSIGNED NOT NULL,
    place_type_id INT UNSIGNED NOT NULL,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    short_description TEXT NULL,
    full_description LONGTEXT NULL,
    cover_image VARCHAR(255) NULL,

    address VARCHAR(500) NULL,

    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,

    contact_name VARCHAR(255) NULL,
    phone VARCHAR(30) NULL,
    telegram VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    status ENUM(
        'pending',
        'published',
        'rejected',
        'expired',
        'closed',
        'archived'
    ) DEFAULT 'pending',

    publication_type ENUM(
        'free',
        'paid'
    ) DEFAULT 'free',

    is_commercial TINYINT(1) DEFAULT 0,

    published_at TIMESTAMP NULL,

    expires_at TIMESTAMP NULL,

    closed_at TIMESTAMP NULL,

    moderated_at TIMESTAMP NULL,

    payment_status ENUM(
        'not_required',
        'unpaid',
        'paid',
        'expired',
        'refunded'
    ) DEFAULT 'not_required',

    booking_type ENUM(
        'chat',
        'phone',
        'external'
    ) DEFAULT 'chat',

    booking_url VARCHAR(500) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_places_category (category_id),
    KEY idx_places_type (place_type_id),
    KEY idx_places_status (status),
    KEY idx_places_user (user_id),
    KEY idx_places_coordinates (
        latitude,
        longitude
    ),

    CONSTRAINT fk_places_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_places_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT fk_places_type
        FOREIGN KEY (place_type_id)
        REFERENCES place_types(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- place_images
-- ----------------------------

CREATE TABLE IF NOT EXISTS place_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    place_id BIGINT UNSIGNED NOT NULL,

    image_path VARCHAR(500) NOT NULL,

    sort_order INT UNSIGNED DEFAULT 0,

    is_cover TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_place_images_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- favorites
-- ----------------------------

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    place_id BIGINT UNSIGNED NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_favorite (
        user_id,
        place_id
    ),

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorites_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- reference_groups
-- ----------------------------

CREATE TABLE IF NOT EXISTS reference_groups (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(100) NOT NULL UNIQUE,

    title VARCHAR(255) NOT NULL,

    description TEXT NULL,

    sort_order INT UNSIGNED DEFAULT 0,

    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO reference_groups
(code, title, sort_order)
VALUES
('property_types', 'Типы недвижимости', 10),
('wall_materials', 'Материалы стен', 20),
('heating_types', 'Типы отопления', 30),
('fish_species', 'Виды рыб', 40),
('hunt_species', 'Виды охоты', 50),
('service_features', 'Услуги и удобства', 60);

-- ----------------------------
-- reference_values
-- ----------------------------

CREATE TABLE IF NOT EXISTS reference_values (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    group_id INT UNSIGNED NOT NULL,

    code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,

    sort_order INT UNSIGNED DEFAULT 0,

    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_reference_value (group_id, code),

    CONSTRAINT fk_reference_values_group
        FOREIGN KEY (group_id)
        REFERENCES reference_groups(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- attribute_definitions
-- ----------------------------

CREATE TABLE IF NOT EXISTS attribute_definitions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    category_id INT UNSIGNED NOT NULL,

    code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,

    field_type ENUM(
        'text',
        'textarea',
        'number',
        'boolean',
        'select',
        'multiselect',
        'date'
    ) NOT NULL,

    reference_group_id INT UNSIGNED NULL,

    is_required TINYINT(1) DEFAULT 0,
    is_filterable TINYINT(1) DEFAULT 0,

    sort_order INT UNSIGNED DEFAULT 0,

    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_attribute_definition (category_id, code),

    CONSTRAINT fk_attribute_definitions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT fk_attribute_definitions_reference_group
        FOREIGN KEY (reference_group_id)
        REFERENCES reference_groups(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- place_attributes
-- ----------------------------

CREATE TABLE IF NOT EXISTS place_attributes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    place_id BIGINT UNSIGNED NOT NULL,

    attribute_definition_id BIGINT UNSIGNED NOT NULL,

    value TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_place_attributes_place (place_id),

    CONSTRAINT fk_place_attributes_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_place_attributes_definition
        FOREIGN KEY (attribute_definition_id)
        REFERENCES attribute_definitions(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- conversations
-- ----------------------------

CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    place_id BIGINT UNSIGNED NOT NULL,

    owner_id BIGINT UNSIGNED NOT NULL,

    user_id BIGINT UNSIGNED NOT NULL,

    last_message_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_conversation (
        place_id,
        owner_id,
        user_id
    ),

    CONSTRAINT fk_conversations_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_conversations_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_conversations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- messages
-- ----------------------------

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    conversation_id BIGINT UNSIGNED NOT NULL,

    sender_id BIGINT UNSIGNED NOT NULL,

    message_text TEXT NULL,

    attachment_path VARCHAR(500) NULL,

    is_read TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- routes
-- ----------------------------

CREATE TABLE IF NOT EXISTS routes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT NULL,

    is_public TINYINT(1) DEFAULT 0,

    share_token VARCHAR(100) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_route_share_token (
        share_token
    ),

    CONSTRAINT fk_routes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- route_places
-- ----------------------------

CREATE TABLE IF NOT EXISTS route_places (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    route_id BIGINT UNSIGNED NOT NULL,

    place_id BIGINT UNSIGNED NOT NULL,

    sort_order INT UNSIGNED DEFAULT 0,

    note TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_route_place (
        route_id,
        place_id
    ),

    CONSTRAINT fk_route_places_route
        FOREIGN KEY (route_id)
        REFERENCES routes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_route_places_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- notifications
-- ----------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    type VARCHAR(100) NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    is_read TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    read_at TIMESTAMP NULL,

    KEY idx_notifications_user (user_id),
    KEY idx_notifications_read (is_read),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- reviews
-- ----------------------------

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    place_id BIGINT UNSIGNED NOT NULL,

    user_id BIGINT UNSIGNED NOT NULL,

    review_text TEXT NOT NULL,

    status ENUM(
        'pending',
        'published',
        'rejected'
    ) DEFAULT 'pending',

    moderated_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_reviews_place (place_id),
    KEY idx_reviews_user (user_id),
    KEY idx_reviews_status (status),

    CONSTRAINT fk_reviews_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- reports
-- ----------------------------

CREATE TABLE IF NOT EXISTS reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    place_id BIGINT UNSIGNED NOT NULL,

    user_id BIGINT UNSIGNED NOT NULL,

    report_type ENUM(
        'outdated',
        'fake',
        'wrong_info',
        'forbidden',
        'spam',
        'other'
    ) NOT NULL,

    message TEXT NULL,

    status ENUM(
        'new',
        'in_progress',
        'resolved',
        'rejected'
    ) DEFAULT 'new',

    resolved_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_reports_place (place_id),
    KEY idx_reports_user (user_id),
    KEY idx_reports_status (status),

    CONSTRAINT fk_reports_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- plans
-- ----------------------------

CREATE TABLE IF NOT EXISTS plans (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(100) NOT NULL UNIQUE,

    title VARCHAR(255) NOT NULL,

    description TEXT NULL,

    max_places INT UNSIGNED DEFAULT 0,

    duration_days INT UNSIGNED DEFAULT 14,

    price DECIMAL(10,2) DEFAULT 0.00,

    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- user_subscriptions
-- ----------------------------

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    plan_id INT UNSIGNED NOT NULL,

    status ENUM(
        'active',
        'expired',
        'cancelled'
    ) DEFAULT 'active',

    starts_at TIMESTAMP NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_user_subscriptions_user (user_id),
    KEY idx_user_subscriptions_plan (plan_id),
    KEY idx_user_subscriptions_status (status),

    CONSTRAINT fk_user_subscriptions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_subscriptions_plan
        FOREIGN KEY (plan_id)
        REFERENCES plans(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- payments
-- ----------------------------

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    subscription_id BIGINT UNSIGNED NULL,

    amount DECIMAL(10,2) NOT NULL,

    currency VARCHAR(10) DEFAULT 'RUB',

    payment_provider VARCHAR(100) NULL,

    provider_payment_id VARCHAR(255) NULL,

    status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) DEFAULT 'pending',

    paid_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_payments_user (user_id),
    KEY idx_payments_subscription (subscription_id),
    KEY idx_payments_status (status),

    CONSTRAINT fk_payments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_payments_subscription
        FOREIGN KEY (subscription_id)
        REFERENCES user_subscriptions(id)
        ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;