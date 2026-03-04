#!/bin/bash

echo "Тестирование API Натальной Карты"
echo "================================="

# Базовый URL
BASE_URL="http://localhost:3000/api/v1"

echo "1. Создание пользователя..."
TIMESTAMP=$(date +%s)
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"user\": {
      \"name\": \"Тестовый Пользователь\",
      \"email\": \"test${TIMESTAMP}@example.com\",
      \"subscription_type\": \"free\"
    }
  }")

echo "Ответ: $USER_RESPONSE"
USER_ID=$(echo $USER_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "ID пользователя: $USER_ID"

if [ -z "$USER_ID" ]; then
  echo "Ошибка: Не удалось создать пользователя"
  exit 1
fi

echo ""
echo "2. Создание натальной карты..."
CHART_RESPONSE=$(curl -s -X POST "$BASE_URL/users/$USER_ID/natal_charts" \
  -H "Content-Type: application/json" \
  -d '{
    "natal_chart": {
      "name": "Тестовая карта",
      "birth_date": "1990-05-15",
      "birth_time": "14:30:00",
      "birth_place": "Москва, Россия",
      "latitude": 55.7558,
      "longitude": 37.6176
    }
  }')

echo "Ответ: $CHART_RESPONSE"
CHART_ID=$(echo $CHART_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "ID натальной карты: $CHART_ID"

echo ""
echo "3. Получение списка натальных карт..."
curl -s -X GET "$BASE_URL/users/$USER_ID/natal_charts" | jq '.'

echo ""
echo "4. Генерация предсказания на сегодня..."
curl -s -X POST "$BASE_URL/users/$USER_ID/daily_predictions/generate_today" | jq '.'

echo ""
echo "5. Получение предсказания на сегодня..."
curl -s -X GET "$BASE_URL/users/$USER_ID/daily_predictions/show/$(date +%Y-%m-%d)" | jq '.'

echo ""
echo "6. Поиск городов (Москва)..."
curl -s -X GET "$BASE_URL/cities/search?q=москва&language=ru&max_rows=5" | jq '.'

echo ""
echo "7. Поиск городов (Санкт-Петербург)..."
curl -s -X GET "$BASE_URL/cities/search?q=санкт&language=ru&max_rows=5" | jq '.'

echo ""
echo "8. Поиск городов (Moscow на английском)..."
curl -s -X GET "$BASE_URL/cities/search?q=moscow&language=en&max_rows=5" | jq '.'

echo ""
echo "Тестирование завершено!"
