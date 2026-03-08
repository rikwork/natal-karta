# frozen_string_literal: true

class ZodiacPrediction < ApplicationRecord
  validates :sign, presence: true
  validates :period, presence: true, inclusion: { in: %w[today tomorrow week month] }
  validates :prediction_date, presence: true
  validates :content, presence: true
  
  validates :sign, uniqueness: { scope: [:period, :prediction_date] }

  scope :for_date, ->(date) { where(prediction_date: date) }
  scope :for_sign, ->(sign) { where(sign: sign) }
  
  def parsed_content
    JSON.parse(content)
  rescue
    {}
  end
end
