# frozen_string_literal: true

class PartnerCompatibilitySerializer
  def initialize(partner_compatibility)
    @partner_compatibility = partner_compatibility
  end

  def as_json
    parsed_compatibility_data = nil

    if @partner_compatibility.compatibility_data.present?
      begin
        parsed_compatibility_data = JSON.parse(@partner_compatibility.compatibility_data)
      rescue JSON::ParserError
        parsed_compatibility_data = @partner_compatibility.compatibility_data
      end
    end

    {
      id: @partner_compatibility.id,
      user_id: @partner_compatibility.user_id,
      partner_name: @partner_compatibility.partner_name,
      partner_birth_date: @partner_compatibility.partner_birth_date,
      partner_birth_time: @partner_compatibility.partner_birth_time,
      partner_birth_place: @partner_compatibility.partner_birth_place,
      partner_latitude: @partner_compatibility.partner_latitude,
      partner_longitude: @partner_compatibility.partner_longitude,
      compatibility_data: parsed_compatibility_data,
      created_at: @partner_compatibility.created_at,
      updated_at: @partner_compatibility.updated_at
    }
  end
end
