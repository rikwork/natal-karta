# frozen_string_literal: true

class NatalChartSerializer
  def initialize(natal_chart)
    @natal_chart = natal_chart
  end

  def as_json
    parsed_chart_data = @natal_chart.chart_data
    
    begin
      if @natal_chart.chart_data.present?
        data = JSON.parse(@natal_chart.chart_data)
        parsed_chart_data = {
          short_summary: data['short_summary'],
          identity: data['identity'],
          emotions: data['emotions'],
          love_preview: get_first_paragraph(data['love']),
          love_locked: get_remaining_paragraphs(data['love']),
          career_preview: get_first_paragraph(data['career']),
          career_locked: get_remaining_paragraphs(data['career']),
          sun: data['sun'] || @natal_chart.user.zodiac_sign || 'Скорпион',
          moon: data['moon'] || 'Весы',
          ascendant: data['ascendant'] || 'Близнецы'
        }
      end
    rescue JSON::ParserError
      # Fallback to raw string if not JSON
    end

    {
      id: @natal_chart.id,
      user_id: @natal_chart.user_id,
      name: @natal_chart.name,
      birth_date: @natal_chart.birth_date,
      birth_time: @natal_chart.birth_time,
      birth_place: @natal_chart.birth_place,
      latitude: @natal_chart.latitude,
      longitude: @natal_chart.longitude,
      chart_data: parsed_chart_data,
      created_at: @natal_chart.created_at,
      updated_at: @natal_chart.updated_at
    }
  end

  private

  def get_first_paragraph(text)
    return nil unless text
    text.split("\n\n").first
  end

  def get_remaining_paragraphs(text)
    return nil unless text
    paragraphs = text.split("\n\n")
    paragraphs.size > 1 ? paragraphs[1..].join("\n\n") : nil
  end
end
