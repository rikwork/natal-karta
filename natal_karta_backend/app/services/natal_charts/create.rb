# frozen_string_literal: true

class NatalCharts::Create
  def self.call(user, params)
    new(user, params).call
  end

  def initialize(user, params)
    @user = user
    @params = params
  end

  def call
    @user.natal_charts.destroy_all
    natal_chart = @user.natal_charts.build(@params)

    if natal_chart.save
      { success: true, data: natal_chart }
    else
      { success: false, errors: natal_chart.errors }
    end
  end
end
