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

### 2. Запуск мобильного приложения (Expo)

```bash
cd NatalKartaExpo
npm install

# Запуск Metro Bundler (откроет панель запуска)
npm start

# Для запуска в браузере (веб-версия)
npm run web
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

В файле `NatalKartaExpo/src/config/api.ts`:

```typescript
export const ENV = {
  API_BASE_URL: 'http://YOUR_IP:3000/api/v1',
};
```

### Интеграция с GPT4Free

Интеграция с GPT4Free уже настроена и работает через системный Python-мост в [gpt_service.rb](file:///Users/nikita/projects/natal_karta/natal_karta_backend/app/services/gpt_service.rb). Для работы требуется установленная библиотека `g4f` (`pip install g4f`), которая вызывается через системный Python.

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

### Expo / React Native не компилируется
```bash
cd NatalKartaExpo
npm install
npx expo start -c
```

### API не отвечает
Проверьте, что Rails сервер запущен на порту 3000:
```bash
curl http://localhost:3000/up
```

---

**Готово!** 🎉 Ваше приложение для натальных карт готово к использованию!
