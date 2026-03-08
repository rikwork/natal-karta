# frozen_string_literal: true

class Api::V1::ZodiacPredictionsController < ApplicationController
  def index
    sign = params[:sign]
    return render json: { error: 'Sign is required' }, status: :bad_request unless sign

    # We use Date.current as the baseline for all predictions generated in the last run
    predictions = ZodiacPrediction.for_sign(sign).where('prediction_date >= ?', Date.current - 1.day)
    
    result = predictions.each_with_object({}) do |p, memo|
      # Only take the latest for each period
      memo[p.period] = p.parsed_content
    end
    
    render json: { data: result }
  end
end
