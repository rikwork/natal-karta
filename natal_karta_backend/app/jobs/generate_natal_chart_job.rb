# frozen_string_literal: true

class GenerateNatalChartJob < ApplicationJob
  queue_as :default

  def perform(user_id, chart_id, locale = 'ru')
    user = User.find(user_id)
    chart = user.natal_charts.find(chart_id)
    result = NatalCharts::Generate.call(user, chart, locale)

    if result[:success]
      ActionCable.server.broadcast("natal_chart_#{user_id}", {
        chart_id: chart_id,
        status: 'completed',
        chart_data: result[:data][:chart_data]
      })
    else
      ActionCable.server.broadcast("natal_chart_#{user_id}", {
        chart_id: chart_id,
        status: 'failed',
        error: result[:error]
      })
    end
  end
end
