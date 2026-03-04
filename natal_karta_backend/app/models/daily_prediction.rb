class DailyPrediction < ApplicationRecord
  belongs_to :user

  validates :prediction_date, presence: true, uniqueness: { scope: :user_id }
  validates :content, presence: true

  scope :for_date, ->(date) { where(prediction_date: date) }
  scope :recent, -> { order(prediction_date: :desc) }
end
