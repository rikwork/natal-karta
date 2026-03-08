# frozen_string_literal: true

namespace :zodiac do
  desc "Generate horoscopes for all signs for all periods (today, tomorrow, week, month)"
  task :generate_all, [:date] => :environment do |t, args|
    signs = %w[Овен Телец Близнецы Рак Лев Дева Весы Скорпион Стрелец Козерог Водолей Рыбы]
    periods = %w[today tomorrow week month]
    
    # По умолчанию генерируем на завтра, если не указано иное
    target_date = args[:date] ? Date.parse(args[:date]) : Date.tomorrow
    
    puts "Starting zodiac horoscope generation for #{target_date}..."
    
    signs.each do |sign|
      puts "Processing #{sign}..."
      periods.each do |period|
        begin
          # Для недели и месяца дата всегда должна быть текущей или началом периода, 
          # но для единообразия используем target_date для привязки
          content = GptService.generate_zodiac_prediction(sign, target_date, period)
          
          prediction = ZodiacPrediction.find_or_initialize_by(
            sign: sign,
            period: period,
            prediction_date: target_date
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

  desc "Cleanup old zodiac predictions (older than yesterday)"
  task cleanup: :environment do
    cutoff_date = Date.yesterday - 1.day
    count = ZodiacPrediction.where("prediction_date < ?", cutoff_date).delete_all
    puts "Cleaned up #{count} old zodiac predictions."
  end
end
