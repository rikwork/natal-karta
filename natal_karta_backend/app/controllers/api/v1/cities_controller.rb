class Api::V1::CitiesController < ApplicationController
  before_action :set_locale

  def search
    query = params[:q]
    language = params[:language] || I18n.locale.to_s
    max_rows = params[:max_rows] || 10

    if query.blank?
      render json: {
        data: [],
        message: I18n.t("cities.search.query_required")
      }, status: :bad_request
      return
    end

    cities = PhotonGeocodingService.search_cities(query, language, max_rows.to_i)

    render json: {
      data: cities,
      message: I18n.t("cities.search.success")
    }
  end

  private

  def set_locale
    # Определяем язык из заголовка Accept-Language или параметра
    locale = params[:locale] ||
             request.headers["Accept-Language"]&.split(",")&.first&.split("-")&.first ||
             "ru"

    # Поддерживаем только русский и английский
    locale = %w[ru en].include?(locale) ? locale : "ru"

    I18n.locale = locale
  end
end
