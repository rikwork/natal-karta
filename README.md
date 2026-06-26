# Натальная Карта - Приложение для астрологии

Полнофункциональное мобильное приложение для составления натальных карт с React Native и Ruby on Rails бэкендом.

## 🚀 Возможности

- **Создание натальных карт** - Ввод данных о рождении (имя, дата, время, место)
- **Предсказания дня** - Ежедневные астрологические предсказания
- **Система подписки** - Бесплатная и премиум версии
- **Просмотр рекламы** - Доступ к премиум функциям через рекламу
- **Генерация через GPT** - Использование GPT4Free для создания натальных карт
- **Современный UI** - Красивый и интуитивный интерфейс

## 📱 Технологии

### Frontend (React Native)
- React Native 0.82.0
- TypeScript
- AsyncStorage для локального хранения
- React Native Date Picker
- React Native Safe Area Context

### Backend (Ruby on Rails)
- Ruby on Rails 8.0.3
- PostgreSQL
- Rack CORS для API
- RESTful API

## 🛠 Установка и запуск

### Предварительные требования

- Node.js >= 20
- Ruby >= 3.0
- PostgreSQL
- Android Studio (для Android)
- Xcode (для iOS)

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd natal_karta
```

### 2. Настройка бэкенда

```bash
cd natal_karta_backend

# Установка зависимостей
bundle install

# Создание базы данных
rails db:create
rails db:migrate

# Запуск сервера
rails server -p 3000
```

### 3. Настройка мобильного приложения (Expo)

```bash
cd NatalKartaExpo

# Установка зависимостей
npm install

# Запуск Metro Bundler
npm start

# Запуск в браузере (веб-версия)
npm run web
```

## 📁 Структура проекта

```
natal_karta/
├── natal_karta_backend/          # Ruby on Rails API
│   ├── app/
│   │   ├── controllers/api/v1/   # API контроллеры
│   │   ├── models/               # Модели данных
│   │   └── services/             # Сервисы (GPT интеграция)
│   └── config/
│       ├── routes.rb             # API маршруты
│       └── initializers/cors.rb  # CORS настройки
└── NatalKartaExpo/               # React Native Expo приложение
    ├── src/
    │   ├── screens/              # Экраны приложения
    │   ├── services/             # API сервисы
    │   ├── types/                # TypeScript типы
    │   └── utils/                # Утилиты
    └── App.tsx                   # Главный компонент
```

## 🔧 API Endpoints

### Пользователи
- `GET /api/v1/users` - Список пользователей
- `POST /api/v1/users` - Создание пользователя
- `GET /api/v1/users/:id` - Получение пользователя
- `PUT /api/v1/users/:id` - Обновление пользователя

### Натальные карты
- `GET /api/v1/users/:user_id/natal_charts` - Список карт пользователя
- `POST /api/v1/users/:user_id/natal_charts` - Создание карты
- `GET /api/v1/users/:user_id/natal_charts/:id` - Получение карты
- `POST /api/v1/users/:user_id/natal_charts/:id/generate` - Генерация карты

### Предсказания
- `GET /api/v1/users/:user_id/daily_predictions` - Список предсказаний
- `GET /api/v1/users/:user_id/daily_predictions/show/:date` - Предсказание на дату
- `POST /api/v1/users/:user_id/daily_predictions/generate_today` - Генерация на сегодня

### Совместимость партнеров
- `GET /api/v1/users/:user_id/partner_compatibilities` - Список совместимостей пользователя
- `POST /api/v1/users/:user_id/partner_compatibilities` - Создание расчета совместимости
- `GET /api/v1/users/:user_id/partner_compatibilities/:id` - Получение совместимости
- `POST /api/v1/users/:user_id/partner_compatibilities/:id/generate` - Запуск генерации совместимости
- `DELETE /api/v1/users/:user_id/partner_compatibilities/:id` - Удаление совместимости

## 🎨 Экраны приложения

1. **Главная страница** - Предсказание дня, быстрые действия
2. **Создание карты** - Форма ввода данных о рождении
3. **Список карт** - Все созданные натальные карты
4. **Детали карты** - Просмотр и генерация натальной карты

## 💰 Монетизация

- **Бесплатная версия** - Ограниченный доступ к функциям
- **Премиум подписка** - Полный доступ ко всем функциям
- **Просмотр рекламы** - Временный доступ к премиум функциям

## 🔮 Интеграция с GPT

Приложение использует GPT4Free для генерации:
- Подробных натальных карт
- Ежедневных астрологических предсказаний
- Персональных рекомендаций

## 📱 Поддерживаемые платформы

- Android (API 21+)
- iOS (12.0+)

## 🚀 Развертывание

### Backend
```bash
# Настройка production окружения
export RAILS_ENV=production
rails assets:precompile
rails db:migrate
```

### Mobile App (Expo EAS)
```bash
# Локальный экспорт сборки
npx expo export

# Сборка через EAS Build
eas build --platform all
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 📞 Поддержка

Для вопросов и поддержки создайте issue в репозитории.

---

**Примечание**: Это демонстрационное приложение. Для продакшена необходимо добавить аутентификацию, валидацию данных и интеграцию с реальными астрологическими API.
