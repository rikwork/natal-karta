# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user_id

    def connect
      self.current_user_id = find_verified_user_id
    end

    private

    def find_verified_user_id
      user_id = request.params[:user_id]
      if user_id.present? && User.exists?(user_id)
        user_id.to_i
      else
        reject_unauthorized_connection
      end
    end
  end
end
