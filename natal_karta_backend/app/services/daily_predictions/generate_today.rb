# frozen_string_literal: true

class DailyPredictions::GenerateToday
  def self.call(user, locale = 'ru')
    new(user, locale).call
  end

  def initialize(user, locale = 'ru')
    @user = user
    @locale = locale
  end

  def call
    date = Date.current
    prediction = @user.daily_predictions.find_or_initialize_by(prediction_date: date)

    content = GptService.generate_daily_prediction(@user, date, @locale)
    prediction.content = content

    if prediction.save
      { success: true, data: prediction }
    else
      { success: false, errors: prediction.errors }
    end
  end
end
