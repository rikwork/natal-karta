require 'open3'
require 'json'

class GptService
  def self.generate_natal_chart(natal_chart)
    prompt = build_natal_chart_prompt(natal_chart)
    generate_content(prompt)
  end

  def self.generate_daily_prediction(user, date)
    prompt = build_daily_prediction_prompt(user, date)
    generate_content(prompt)
  end

  private

  def self.build_natal_chart_prompt(natal_chart)
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
    PROMPT
  end

  def self.build_daily_prediction_prompt(user, date)
    natal_chart = user.natal_charts.first
    return "Нет данных о натальной карте" unless natal_chart

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
    PROMPT
  end


  def self.get_zodiac_sign(birth_date)
    month = birth_date.month
    day = birth_date.day

    case month
    when 1
      day <= 19 ? "\u041A\u043E\u0437\u0435\u0440\u043E\u0433" : "\u0412\u043E\u0434\u043E\u043B\u0435\u0439"
    when 2
      day <= 18 ? "\u0412\u043E\u0434\u043E\u043B\u0435\u0439" : "\u0420\u044B\u0431\u044B"
    when 3
      day <= 20 ? "\u0420\u044B\u0431\u044B" : "\u041E\u0432\u0435\u043D"
    when 4
      day <= 19 ? "\u041E\u0432\u0435\u043D" : "\u0422\u0435\u043B\u0435\u0446"
    when 5
      day <= 20 ? "\u0422\u0435\u043B\u0435\u0446" : "\u0411\u043B\u0438\u0437\u043D\u0435\u0446\u044B"
    when 6
      day <= 20 ? "\u0411\u043B\u0438\u0437\u043D\u0435\u0446\u044B" : "\u0420\u0430\u043A"
    when 7
      day <= 22 ? "\u0420\u0430\u043A" : "\u041B\u0435\u0432"
    when 8
      day <= 22 ? "\u041B\u0435\u0432" : "\u0414\u0435\u0432\u0430"
    when 9
      day <= 22 ? "\u0414\u0435\u0432\u0430" : "\u0412\u0435\u0441\u044B"
    when 10
      day <= 22 ? "\u0412\u0435\u0441\u044B" : "\u0421\u043A\u043E\u0440\u043F\u0438\u043E\u043D"
    when 11
      day <= 21 ? "\u0421\u043A\u043E\u0440\u043F\u0438\u043E\u043D" : "\u0421\u0442\u0440\u0435\u043B\u0435\u0446"
    when 12
      day <= 21 ? "\u0421\u0442\u0440\u0435\u043B\u0435\u0446" : "\u041A\u043E\u0437\u0435\u0440\u043E\u0433"
    end
  end

  def self.generate_content(prompt)
    script_path = Rails.root.join('lib', 'g4f_bridge.py')
    
    stdout, stderr, status = Open3.capture3("python3", script_path.to_s, prompt)
    
    if status.success?
      begin
        json_match = stdout.match(/\{.*\}/m)
        unless json_match
          return { error: "No JSON found in output: #{stdout}" }.to_json
        end
        
        result = JSON.parse(json_match[0])
        if result['success']
          g4f_response = result['data']
          # Remove markdown block if present
          clean_response = g4f_response.gsub(/```json\n?/, '').gsub(/```\n?/, '').strip
          
          # Verify it's valid JSON
          JSON.parse(clean_response)
          
          return clean_response # Return JSON string
        else
          return { error: result['error'] }.to_json
        end
      rescue JSON::ParserError => e
        return { error: "Failed to parse JSON: #{e.message}" }.to_json
      end
    else
      return { error: "Python script failed: #{stderr}" }.to_json
    end
  end
end
