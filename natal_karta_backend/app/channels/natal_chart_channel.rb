# frozen_string_literal: true

class NatalChartChannel < ApplicationCable::Channel
  def subscribed
    if current_user_id == params[:user_id].to_i
      user = User.find_by(id: current_user_id)
      if user && params[:firebase_uid].present? && user.firebase_uid == params[:firebase_uid]
        stream_from "natal_chart_#{current_user_id}"
      else
        reject
      end
    else
      reject
    end
  end

  def unsubscribed
  end
end
