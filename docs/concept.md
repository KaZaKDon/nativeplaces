# Родные Места — архитектура и roadmap

## Общая концепция проекта

«Родные Места» — атмосферная geo-platform, объединяющая:

* недвижимость;
* аренду жилья;
* базы отдыха;
* рыбалку;
* охоту;
* природные и туристические места.

Проект строится как cinematic exploration platform:
не просто карта объектов, а визуальная среда исследования территории.

---

# Текущая архитектура проекта

## Frontend stack

* React
* Vite
* React Router
* Leaflet
* React-Leaflet

---

# Структура интерфейса

## 1. HomePage

Главный cinematic entrance screen.

### Реализовано:

* fullscreen hero;
* cinematic background;
* staged animation sequence;
* адаптивная mobile layout;
* кнопки перехода:

  * карта;
  * категории;
* минималистичный UI без перегруза;
* отдельный CSS;
* animation sequence:

  * title;
  * subtitle;
  * buttons.

---

## 2. MapPage

Главная interactive exploration area.

### Реализовано:

* Leaflet map;
* sidebar;
* фильтрация по категориям;
* selectedPlace state;
* hover interactions;
* tooltip labels;
* flyTo animation;
* active marker state;
* category marker colors;
* responsive layout;
* compact sidebar list;
* load more logic;
* modular structure.

---

# Реализованный UX карты

## Sidebar

Sidebar выполняет роль:

* фильтрации;
* списка объектов;
* панели информации.

### Состояния:

#### List state

Показывает:

* категории;
* количество объектов;
* compact cards;
* lazy loading списка.

#### Selected state

Показывает:

* фото объекта;
* описание;
* location info;
* metadata.

---

# Marker System

## Marker colors

Каждая категория имеет собственный цвет:

* Рыбалка — бирюзовый;
* Природа — оливковый;
* Недвижимость — золотистый;
* Аренда — светло-голубой;
* Базы отдыха — фиолетовый;
* Охота — коричневый.

---

## Active marker

Выбранный marker:

* увеличивается;
* подсвечивается;
* использует muted red accent.

---

## Hover marker

При hover:

* marker glow усиливается;
* tooltip появляется;
* sidebar и карта визуально связываются.

---

# CategoriesPage

## Концепция

Категории — это не каталог.

Это:

* table of directions;
* explorer selection screen;
* visual gateway в карту.

---

## Визуальная идея

Фон:

* folded vintage map;
* atmospheric dark lighting;
* Russian labels;
* old atlas feeling.

Карточки:

* floating;
* cinematic;
* slightly rotated;
* glass/dark styling;
* immersive atmosphere.

---

# Что будет в категориях

## Недвижимость

### Будет содержать:

* дома;
* участки;
* дачи;
* объекты у воды;
* загородную недвижимость.

### Для объявлений:

* цена;
* площадь дома;
* площадь участка;
* фотографии;
* координаты;
* контакты;
* описание;
* коммуникации.

---

## Аренда

### Будет содержать:

* дома;
* гостиницы;
* глэмпинги;
* посуточную аренду;
* турбазы.

### Для объявлений:

* стоимость;
* вместимость;
* фото;
* удобства;
* контакты;
* бронирование.

---

## Базы отдыха

### Будет содержать:

* базы;
* туркомплексы;
* семейный отдых;
* waterfront locations.

---

## Рыбалка

### Будет содержать:

* реки;
* озера;
* места ловли;
* рыболовные базы;
* описание видов рыбы;
* сезонность;
* подъезды;
* фото;
* координаты.

---

## Охота

### Будет содержать:

* охотничьи территории;
* охотничьи базы;
* природные зоны;
* сезонность;
* информация по угодьям.

---

## Природа

### Будет содержать:

* озера;
* степи;
* заповедники;
* смотровые места;
* природные достопримечательности;
* места отдыха.

---

# Что будет на карте

## Unified map system

Все категории работают через единую карту.

---

## Карта будет поддерживать:

* category filtering;
* dynamic markers;
* sidebar states;
* search;
* clustering;
* hover interactions;
* cinematic flyTo;
* lazy loading;
* mobile UX.

---

# Планируемые функции карты

## 1. Search system

Поиск:

* мест;
* населенных пунктов;
* объявлений;
* объектов.

---

## 2. Marker clustering

При большом количестве объектов:

* объединение точек;
* zoom clusters;
* оптимизация производительности.

---

## 3. Nearby places

Связанные объекты рядом:

* жилье рядом с рыбалкой;
* отдых рядом с природой;
* nearby recommendations.

---

## 4. User content

В перспективе:

* пользовательские объявления;
* добавление мест;
* moderation system.

---

## 5. Backend integration

Планируется переход:

* PHP API;
* MySQL database;
* dynamic data loading.

---

# Архитектурный подход

## Frontend

Frontend строится:

* modular;
* scalable;
* component-based.

---

## Data layer

Сейчас используется mock data.

В будущем:

* API;
* database;
* admin panel.

---

## Основная цель проекта

Создать:

не просто карту,
не просто каталог,
не просто marketplace.

А:

cinematic geo-platform,
которая вызывает ощущение:

* исследования;
* путешествия;
* родных мест;
* живой территории.
