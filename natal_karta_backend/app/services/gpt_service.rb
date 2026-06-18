# frozen_string_literal: true

require 'open3'
require 'json'

class GptService
  def self.generate_natal_chart(natal_chart, locale = 'ru')
    prompt = build_natal_chart_prompt(natal_chart, locale)
    generate_content(prompt)
  end

  def self.generate_daily_prediction(user, date, locale = 'ru')
    prompt = build_daily_prediction_prompt(user, date, locale)
    generate_content(prompt)
  end

  def self.generate_zodiac_prediction(sign, date, period = 'today', locale = 'ru')
    prompt = build_zodiac_prediction_prompt(sign, date, period, locale)
    generate_content(prompt)
  end

  class << self
    private

    def language_name_for(locale)
      locale.to_s == 'en' ? 'английский' : 'русский'
    end

    def build_natal_chart_prompt(natal_chart, locale)
      locale_name = language_name_for(locale)
      <<~PROMPT
        Создай подробную астрологическую натальную карту для человека. ДУМАЙ ПОШАГОВО (think step by step), будь профессиональным астрологом. Вчитывайся в каждую деталь и давай максимально глубокий и подробный анализ.
        Имя: #{natal_chart.name}
        Дата рождения: #{natal_chart.birth_date.strftime('%d.%m.%Y')}
        Время рождения: #{natal_chart.birth_time.strftime('%H:%M')}
        Место: #{natal_chart.birth_place}
        Координаты: #{natal_chart.latitude}, #{natal_chart.longitude}

        Твой ответ должен быть СТРОГО в формате JSON с 5 ключами: "short_summary", "identity", "emotions", "love", "career". Никакого дополнительного текста до или после JSON.
        
        В ключе "short_summary" (Краткий результат):
        Очень кратко (в 1-2 предложениях) опиши общую суть карты. Например: "Твое Солнце в Скорпионе дает тебе страсть, а Луна в Весах — стремление к гармонии."

        В ключе "identity" (Личность и карма):
        Опиши знак зодиака солнца, асцендент, сильные и слабые стороны, кармические задачи. Минимум 3 абзаца.

        В ключе "emotions" (Эмоции и внутренний мир):
        Опиши знак Луны, внутренние потребности, скрытые страхи и способы восстановления ресурса. Объемный анализ (минимум 2 абзаца).

        В ключе "love" (Любовь и совместимость):
        Опиши Венеру, подходящие типажи, дом партнерства. Объемный анализ. Обязательно разбей текст на логические абзацы (через \\n\\n). Первый абзац должен быть кратким "тизером", а остальные - подробным разбором. 

        В ключе "career" (Карьера и деньги):
        Опиши предрасположенности к профессиям, отношения с деньгами. Объемный анализ. Также разбей на абзацы (через \\n\\n), где первый - это "тизер".

        Отвечай ТОЛЬКО валидным JSON. Разметка markdown вокруг JSON запрещена.
        Все значения в JSON (тексты предсказаний и разборов) должны быть строго на языке: #{locale_name}.
      PROMPT
    end

    def build_zodiac_prediction_prompt(sign, date, period, locale)
      locale_name = language_name_for(locale)
      duration = case period
                 when 'today' then "день #{date.strftime('%d.%m.%Y')}"
                 when 'tomorrow' then "день #{(date + 1.day).strftime('%d.%m.%Y')}"
                 when 'week' then "неделю с #{date.strftime('%d.%m.%Y')}"
                 when 'month' then "месяц #{date.strftime('%m.%Y')}"
                 else "день #{date.strftime('%d.%m.%Y')}"
                 end

      <<~PROMPT
        Создай профессиональный астрологический гороскоп на #{duration} для знака зодиака #{sign}. 
        ДУМАЙ ПОШАГОВО (think step by step). Будь вдохновляющим, но реалистичным.

        Включи в гороскоп:
        1. Общую энергетику и настроение периода
        2. Рекомендации в сферах любви, карьеры и саморазвития
        3. Предупреждения (на что обратить внимание)
        4. Благоприятные часы или дни (если прогноз на неделю/месяц)
        5. Цвет удачи
        6. Число удачи

        Ответ должен быть СТРОГО в формате JSON с ключами: "energy", "recommendations", "warnings", "lucky_hours", "color", "number".
        "recommendations" and "warnings" должны быть массивами строк.
        Никакого текста кроме валидного JSON (разметка markdown вокруг JSON запрещена).
        Все значения в JSON должны быть строго на языке: #{locale_name}.
      PROMPT
    end

    def build_daily_prediction_prompt(user, date, locale)
      locale_name = language_name_for(locale)
      natal_chart = user.natal_charts.first
      return 'Нет данных о натальной карте' unless natal_chart

      <<~PROMPT
        Создай предсказание на день #{date.strftime('%d.%m.%Y')} для человека. ДУМАЙ ПОШАГОВО (think step by step).
        Имя: #{user.name}
        Знак зодиака: #{get_zodiac_sign(natal_chart.birth_date)}

        Включи в предсказание:
        1. Общую энергетику дня
        2. Рекомендации по делам (персонализированные советы)
        3. Предупреждения
        4. Благоприятные часы
        5. Цвет дня
        6. Число дня

        Ответ должен быть СТРОГО в формате JSON с ключами: "energy", "recommendations", "warnings", "lucky_hours", "color", "number".
        Никакого текста кроме валидного JSON (разметка markdown вокруг JSON запрещена).
        Все значения в JSON должны быть строго на языке: #{locale_name}.
      PROMPT
    end

    def get_zodiac_sign(birth_date)
      month = birth_date.month
      day = birth_date.day

      case month
      when 1  then day <= 19 ? 'Козерог' : 'Водолей'
      when 2  then day <= 18 ? 'Водолей' : 'Рыбы'
      when 3  then day <= 20 ? 'Рыбы' : 'Овен'
      when 4  then day <= 19 ? 'Овен' : 'Телец'
      when 5  then day <= 20 ? 'Телец' : 'Близнецы'
      when 6  then day <= 20 ? 'Близнецы' : 'Рак'
      when 7  then day <= 22 ? 'Рак' : 'Лев'
      when 8  then day <= 22 ? 'Лев' : 'Дева'
      when 9  then day <= 22 ? 'Дева' : 'Весы'
      when 10 then day <= 22 ? 'Весы' : 'Скорпион'
      when 11 then day <= 21 ? 'Скорпион' : 'Стрелец'
      when 12 then day <= 21 ? 'Стрелец' : 'Козерог'
      end
    end

    def generate_content(prompt)
      script_path = Rails.root.join('lib', 'g4f_bridge.py')
      stdout, stderr, status = Open3.capture3('/usr/bin/python3', script_path.to_s, prompt)
      return { error: "Python script failed: #{stderr}" }.to_json unless status.success?

      parse_gpt_response(stdout)
    end

    def parse_gpt_response(stdout)
      json_match = stdout.match(/\{.*\}/m)
      return { error: "No JSON found in output: #{stdout}" }.to_json unless json_match

      result = JSON.parse(json_match[0])
      return { error: result['error'] }.to_json unless result['success']

      process_clean_json(result['data'])
    rescue JSON::ParserError => e
      { error: "Failed to parse JSON: #{e.message}" }.to_json
    end

    def process_clean_json(data)
      clean_response = data.gsub(/```json\n?/, '').gsub(/```\n?/, '').strip
      JSON.parse(clean_response)
      clean_response
    end
  end
end
