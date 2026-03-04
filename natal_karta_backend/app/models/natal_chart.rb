class NatalChart < ApplicationRecord
  belongs_to :user

  validates :name, presence: true
  validates :birth_date, presence: true
  validates :birth_time, presence: true
  validates :birth_place, presence: true
  validates :latitude, presence: true, numericality: { in: -90..90 }
  validates :longitude, presence: true, numericality: { in: -180..180 }

  scope :recent, -> { order(created_at: :desc) }
end
