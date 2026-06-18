# frozen_string_literal: true

class ApplicationController < ActionController::API
  private

  def user_locale
    header = request.headers['Accept-Language']
    return 'ru' if header.blank?

    locale = header.split(',').first&.split('-')&.first&.downcase
    ['ru', 'en'].include?(locale) ? locale : 'ru'
  end
end
