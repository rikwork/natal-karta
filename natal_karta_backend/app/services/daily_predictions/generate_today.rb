class DailyPredictions::GenerateToday
  def self.call(user)
    new(user).call
  end

  def initialize(user)
    @user = user
  end

  def call
    date = Date.current
    prediction = @user.daily_predictions.find_or_initialize_by(prediction_date: date)

    content = GptService.generate_daily_prediction(@user, date)
    prediction.content = content

    if prediction.save
      { success: true, data: prediction }
    else
      { success: false, errors: prediction.errors }
    end
  end
end
