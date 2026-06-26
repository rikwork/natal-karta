# frozen_string_literal: true

module PartnerCompatibilities
  class Generate
    def self.call(user, partner_compatibility, locale = 'ru')
      new(user, partner_compatibility, locale).call
    end

    def initialize(user, partner_compatibility, locale = 'ru')
      @user = user
      @partner_compatibility = partner_compatibility
      @locale = locale
    end

    def call
      user_chart = @user.natal_charts.recent.first
      return { success: false, error: "У вас должна быть создана натальная карта для расчета совместимости" } unless user_chart

      compatibility_data_string = GptService.generate_partner_compatibility(
        user_chart,
        @partner_compatibility.partner_name,
        @partner_compatibility.partner_birth_date,
        @partner_compatibility.partner_birth_time,
        @partner_compatibility.partner_birth_place,
        @locale
      )

      begin
        parsed = JSON.parse(compatibility_data_string)
        return { success: false, error: parsed['error'] } if parsed['error']
      rescue JSON::ParserError
        return { success: false, error: "Не удалось разобрать ответ: #{compatibility_data_string[0..100]}" }
      end

      @partner_compatibility.update(compatibility_data: compatibility_data_string)

      { success: true, data: { compatibility_data: compatibility_data_string } }
    end
  end
end
