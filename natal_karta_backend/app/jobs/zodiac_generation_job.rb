# frozen_string_literal: true

class ZodiacGenerationJob < ApplicationJob
  queue_as :default

  def perform(date_str = nil)
    signs = %w[Овен Телец Близнецы Рак Лев Дева Весы Скорпион Стрелец Козерог Водолей Рыбы]
    periods = %w[today tomorrow week month]
    target_date = date_str ? Date.parse(date_str) : Date.tomorrow

    Rails.logger.info "[ZodiacGenerationJob] Starting zodiac horoscope generation for #{target_date}..."

    signs.each do |sign|
      Rails.logger.info "[ZodiacGenerationJob] Processing #{sign}..."
      periods.each do |period|
        begin
          content = GptService.generate_zodiac_prediction(sign, target_date, period)
          
          prediction = ZodiacPrediction.find_or_initialize_by(
            sign: sign,
            period: period,
            prediction_date: target_date
          )
          
          prediction.content = content
          if prediction.save
            Rails.logger.info "  [OK] #{sign} - #{period}"
          else
            Rails.logger.error "  [ERR] #{sign} - #{period}: #{prediction.errors.full_messages.join(', ')}"
          end
        rescue => e
          Rails.logger.error "  [FAILED] #{sign} - #{period}: #{e.message}"
        end
      end
    end
    Rails.logger.info "[ZodiacGenerationJob] Generation complete!"
  end
end
