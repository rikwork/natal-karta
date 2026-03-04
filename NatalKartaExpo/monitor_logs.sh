#!/bin/bash

echo "🔍 Мониторинг логов OnboardingScreen..."
echo "Откройте приложение в Expo Go и прокручивайте селекторы даты"
echo "Логи будут отображаться здесь:"
echo "=========================================="

# Запускаем Metro bundler с выводом логов
cd /Users/nikita/projects/natal_karta/NatalKartaExpo
npx expo start --clear
