# frozen_string_literal: true

class User < ApplicationRecord
  has_many :natal_charts, dependent: :destroy
  has_many :daily_predictions, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  def has_active_subscription?
    subscription_type == "premium" && subscription_expires_at&.future?
  end

  def can_update_birth_data?
    birth_data_updated_at.nil? || birth_data_updated_at < 24.hours.ago
  end
end
