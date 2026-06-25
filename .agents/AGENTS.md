# Natal Karta Workspace Customization Rules

## 🔍 Где искать ошибки и логи
* **Ошибки времени выполнения (Runtime Errors):** Клиент отправляет все перехваченные JS-ошибки на бэкенд. Проверить их список можно в браузере по адресу `http://localhost:3000/api/v1/error_logs`.
* **Логи бэкенда (Rails):** Записываются локально в файл `natal_karta_backend/log/development.log`.
* **Логи фронтенда (React Native):** В реальном времени отображаются в терминале, где запущен Metro-бандлер (`npx expo start`), если телефон подключен к нему.

## 🛠️ Как собирать мобильное приложение
* **Внимание:** Из-за использования нативных модулей (реклама, маски) запуск через обычное приложение Expo Go приведет к ошибкам (например, `Cannot find view manager`).
* **Сборка клиента (Development Build):**
  * *Локально (быстрее):* `npx expo run:android` или `npx expo run:ios` (требует локально настроенных Android SDK / Xcode).
  * *В облаке:* `npx eas build --profile development --platform android/ios` (собирает готовый APK в облаке Expo).
