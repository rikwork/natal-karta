class UserDailyCard < ApplicationRecord
  belongs_to :user

  validates :user_id, uniqueness: { scope: :drawn_on, message: "can only draw one card per day" }
  validates :tarot_card_id, presence: true, inclusion: { in: 1..78 }
  validates :drawn_on, presence: true

  scope :for_today, -> { where(drawn_on: Date.today) }
end
