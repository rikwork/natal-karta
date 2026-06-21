# frozen_string_literal: true

class NatalChartChannel < ApplicationCable::Channel
  def subscribed
    stream_from "natal_chart_#{params[:user_id]}"
  end

  def unsubscribed
  end
end
