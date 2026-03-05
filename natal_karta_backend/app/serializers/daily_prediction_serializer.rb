# frozen_string_literal: true

class DailyPredictionSerializer
  def initialize(prediction)
    @prediction = prediction
  end

  def as_json
    parsed_content = @prediction.content
    
    begin
      if @prediction.content.present?
        parsed = JSON.parse(@prediction.content)
        parsed_content = parsed if parsed.is_a?(Hash)
      end
    rescue JSON::ParserError
      # Fallback to raw string if not JSON
    end

    {
      id: @prediction.id,
      content: parsed_content,
      prediction_date: @prediction.prediction_date,
      created_at: @prediction.created_at,
      updated_at: @prediction.updated_at
    }
  end

end
