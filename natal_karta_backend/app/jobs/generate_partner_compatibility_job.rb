# frozen_string_literal: true

class GeneratePartnerCompatibilityJob < ApplicationJob
  queue_as :default

  def perform(user_id, compatibility_id, locale = 'ru')
    user = User.find(user_id)
    compatibility = user.partner_compatibilities.find(compatibility_id)
    result = PartnerCompatibilities::Generate.call(user, compatibility, locale)

    if result[:success]
      ActionCable.server.broadcast("partner_compatibility_#{user_id}", {
                                     compatibility_id: compatibility_id,
                                     status: 'completed',
                                     compatibility_data: result[:data][:compatibility_data]
                                   })
    else
      ActionCable.server.broadcast("partner_compatibility_#{user_id}", {
                                     compatibility_id: compatibility_id,
                                     status: 'failed',
                                     error: result[:error]
                                   })
    end
  end
end
