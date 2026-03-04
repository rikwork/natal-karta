class Api::V1::DailyPredictionsController < ApplicationController
  before_action :set_user

  def index
    @predictions = @user.daily_predictions.recent
    render json: @predictions.map { |prediction| DailyPredictionSerializer.new(prediction).as_json }
  end

  def show
    date = params[:date] ? Date.parse(params[:date]) : Date.current
    @prediction = @user.daily_predictions.for_date(date).first

    if @prediction
      render json: DailyPredictionSerializer.new(@prediction).as_json
    else
      render json: { error: "Предсказание на этот день не найдено" }, status: :not_found
    end
  end

  def create
    date = params[:prediction_date] ? Date.parse(params[:prediction_date]) : Date.current

    @prediction = @user.daily_predictions.find_or_initialize_by(prediction_date: date)

    if @prediction.persisted?
      render json: { error: "Предсказание на этот день уже существует" }, status: :conflict
      return
    end

    content = GptService.generate_daily_prediction(@user, date)
    @prediction.content = content

    if @prediction.save
      render json: DailyPredictionSerializer.new(@prediction).as_json, status: :created
    else
      render json: { errors: @prediction.errors }, status: :unprocessable_entity
    end
  end

  def generate_today
    result = DailyPredictions::GenerateToday.call(@user)

    if result[:success]
      render json: DailyPredictionSerializer.new(result[:data]).as_json
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  end
end
