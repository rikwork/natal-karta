# frozen_string_literal: true

class User < ApplicationRecord
  has_many :natal_charts, dependent: :destroy
  has_many :daily_predictions, dependent: :destroy
  has_many :user_daily_cards, dependent: :destroy
  has_many :partner_compatibilities, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  def zodiac_sign
    chart = natal_charts.recent.first
    return nil unless chart&.birth_date

    calculate_zodiac_sign(chart.birth_date)
  end

  def has_active_subscription?
    subscription_type == "premium" && subscription_expires_at&.future?
  end

  def can_update_birth_data?
    birth_data_updated_at.nil? || birth_data_updated_at < 24.hours.ago
  end

  private

  def calculate_zodiac_sign(date)
    day = date.day
    month = date.month

    case month
    when 1 then day >= 20 ? "Водолей" : "Козерог"
    when 2 then day >= 19 ? "Рыбы" : "Водолей"
    when 3 then day >= 21 ? "Овен" : "Рыбы"
    when 4 then day >= 20 ? "Телец" : "Овен"
    when 5 then day >= 21 ? "Близнецы" : "Телец"
    when 6 then day >= 21 ? "Рак" : "Близнецы"
    when 7 then day >= 23 ? "Лев" : "Рак"
    when 8 then day >= 23 ? "Дева" : "Лев"
    when 9 then day >= 23 ? "Весы" : "Дева"
    when 10 then day >= 23 ? "Скорпион" : "Весы"
    when 11 then day >= 22 ? "Стрелец" : "Скорпион"
    when 12 then day >= 22 ? "Козерог" : "Стрелец"
    end
  end
end
