# frozen_string_literal: true

namespace :zodiac do
  desc "Generate horoscopes for all signs for all periods (today, tomorrow, week, month)"
  task generate_all: :environment do
    signs = %w[Овен Телец Близнецы Рак Лев Дева Весы Скорпион Стрелец Козерог Водолей Рыбы]
    periods = %w[today tomorrow week month]
    date = Date.current
    
    puts "Starting zodiac horoscope generation for #{date}..."
    
    signs.each do |sign|
      puts "Processing #{sign}..."
      periods.each do |period|
        begin
          content = GptService.generate_zodiac_prediction(sign, date, period)
          
          prediction = ZodiacPrediction.find_or_initialize_by(
            sign: sign,
            period: period,
            prediction_date: date
          )
          
          prediction.content = content
          if prediction.save
            puts "  [OK] #{period}"
          else
            puts "  [ERR] #{period}: #{prediction.errors.full_messages.join(', ')}"
          end
        rescue => e
          puts "  [FAILED] #{period}: #{e.message}"
        end
      end
    end
    
    puts "Generation complete!"
  end
end
