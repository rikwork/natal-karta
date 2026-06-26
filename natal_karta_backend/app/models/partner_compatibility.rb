# frozen_string_literal: true

class PartnerCompatibility < ApplicationRecord
  belongs_to :user

  validates :partner_name, presence: true
  validates :partner_birth_date, presence: true
  validates :partner_birth_place, presence: true

  scope :recent, -> { order(created_at: :desc) }
end
