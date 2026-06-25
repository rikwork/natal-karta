# frozen_string_literal: true

class ZodiacCleanupJob < ApplicationJob
  queue_as :default

  def perform
    cutoff_date = Date.yesterday - 1.day
    count = ZodiacPrediction.where("prediction_date < ?", cutoff_date).delete_all
    Rails.logger.info "[ZodiacCleanupJob] Cleaned up #{count} old zodiac predictions."
  end
end
