# frozen_string_literal: true

class Api::V1::NatalChartsController < ApplicationController
  before_action :set_user
  before_action :set_natal_chart, only: [ :show, :update, :destroy, :generate ]

  def index
    @natal_charts = @user.natal_charts.recent
    render json: @natal_charts.map { |chart| NatalChartSerializer.new(chart).as_json }
  end

  def show
    render json: NatalChartSerializer.new(@natal_chart).as_json
  end

  def create
    unless @user.can_update_birth_data?
      return render json: { error: "Вы можете изменять данные рождения только раз в день" }, status: :too_many_requests
    end

    result = NatalCharts::Create.call(@user, natal_chart_params)

    if result[:success]
      @user.update!(birth_data_updated_at: Time.current)
      render json: NatalChartSerializer.new(result[:data]).as_json, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    if @natal_chart.update(natal_chart_params)
      render json: NatalChartSerializer.new(@natal_chart).as_json
    else
      render json: { errors: @natal_chart.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @natal_chart.destroy
    head :no_content
  end

  def generate
    result = NatalCharts::Generate.call(@user, @natal_chart, user_locale)

    if result[:success]
      render json: NatalChartSerializer.new(@natal_chart).as_json
    else
      render json: { error: result[:error] }, status: :forbidden
    end
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  end

  def set_natal_chart
    @natal_chart = @user.natal_charts.find(params[:id])
  end

  def natal_chart_params
    params.require(:natal_chart).permit(:name, :birth_date, :birth_time, :birth_place, :latitude, :longitude)
  end
end
