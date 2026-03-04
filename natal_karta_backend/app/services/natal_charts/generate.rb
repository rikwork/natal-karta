class NatalCharts::Generate
  def self.call(user, natal_chart)
    new(user, natal_chart).call
  end

  def initialize(user, natal_chart)
    @user = user
    @natal_chart = natal_chart
  end

  def call
    chart_data_string = GptService.generate_natal_chart(@natal_chart)
    
    begin
      parsed = JSON.parse(chart_data_string)
      if parsed['error']
        return { success: false, error: parsed['error'] }
      end
    rescue JSON::ParserError
      return { success: false, error: "Failed to parse GPT response: #{chart_data_string[0..100]}" }
    end

    @natal_chart.update(chart_data: chart_data_string)

    { success: true, data: { chart_data: chart_data_string } }
  end
end
