# 🚀 Быстрый старт - Натальная Карта

## Запуск приложения за 5 минут

### 1. Запуск бэкенда

```bash
cd natal_karta_backend
bundle install
rails db:create
rails db:migrate
rails server -p 3000
```

### 2. Запуск мобильного приложения

```bash
cd NatalKartaApp/NatalKartaApp
npm install

# Для Android
npx react-native run-android

# Для iOS (macOS)
npx react-native run-ios
```

### 3. Тестирование API

```bash
# Запуск тестового скрипта
./test_api.sh
```

## 📱 Что умеет приложение

✅ **Создание натальных карт** - Ввод данных о рождении  
✅ **Предсказания дня** - Ежедневные астрологические прогнозы  
✅ **Система подписки** - Бесплатная и премиум версии  
✅ **Просмотр рекламы** - Доступ к премиум функциям  
✅ **Современный UI** - Красивый интерфейс в стиле Co-Star  

## 🔧 Настройка для разработки

### Изменение URL API

В файле `NatalKartaApp/NatalKartaApp/src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://YOUR_IP:3000/api/v1';
```

### Добавление реальной интеграции с GPT

В файле `natal_karta_backend/app/services/gpt_service.rb` замените заглушку на реальный вызов GPT4Free.

## 🎯 Следующие шаги

1. **Интеграция с GPT4Free** - Замените заглушки на реальные вызовы
2. **Добавление аутентификации** - JWT токены для безопасности
3. **Интеграция рекламы** - AdMob или Facebook Ads
4. **Пуш-уведомления** - Для ежедневных предсказаний
5. **Офлайн режим** - Кэширование данных

## 🐛 Решение проблем

### Rails сервер не запускается
```bash
bundle install
rails db:create
rails db:migrate
```

### React Native не компилируется
```bash
cd NatalKartaApp/NatalKartaApp
npm install
npx react-native start --reset-cache
```

### API не отвечает
Проверьте, что Rails сервер запущен на порту 3000:
```bash
curl http://localhost:3000/up
```

---

**Готово!** 🎉 Ваше приложение для натальных карт готово к использованию!
