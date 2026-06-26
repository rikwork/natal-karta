# frozen_string_literal: true

require "test_helper"

class PartnerCompatibilitiesGenerateTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
    @partner_compatibility = partner_compatibilities(:one)
  end

  test "should fail if user has no natal chart" do
    # Remove natal charts for the user
    @user.natal_charts.destroy_all

    result = PartnerCompatibilities::Generate.call(@user, @partner_compatibility)
    assert_not result[:success]
    assert_equal "У вас должна быть создана натальная карта для расчета совместимости", result[:error]
  end

  test "should succeed and update compatibility_data if user has natal chart" do
    # Ensure user has natal chart
    assert @user.natal_charts.exists?

    mock_gpt_response = '{"overall_score": 88, "love_score": 92, "friendship_score": 85, "communication_score": 88, "summary": "Great compatibility", "love_details": "Details", "friendship_details": "Details", "communication_details": "Details", "challenges": "Challenges", "partner_sun": "Aries", "partner_moon": "Taurus", "partner_ascendant": "Gemini"}'

    GptService.stub :generate_partner_compatibility, mock_gpt_response do
      result = PartnerCompatibilities::Generate.call(@user, @partner_compatibility)
      assert result[:success]
      assert_equal mock_gpt_response, result[:data][:compatibility_data]

      @partner_compatibility.reload
      assert_equal mock_gpt_response, @partner_compatibility.compatibility_data
    end
  end

  test "should handle JSON parsing errors" do
    assert @user.natal_charts.exists?

    invalid_gpt_response = "invalid json response"

    GptService.stub :generate_partner_compatibility, invalid_gpt_response do
      result = PartnerCompatibilities::Generate.call(@user, @partner_compatibility)
      assert_not result[:success]
      assert_match /Не удалось разобрать ответ/, result[:error]
    end
  end
end
