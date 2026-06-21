# frozen_string_literal: true

require "test_helper"

class Api::V1::DailyCardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(name: "Tarot User", email: "tarot_api_test@example.com")
  end

  test "should generate daily card on first request" do
    assert_difference -> { @user.user_daily_cards.count }, 1 do
      get api_v1_user_daily_card_url(user_id: @user.id), as: :json
    end

    assert_response :success
    json_response = JSON.parse(response.body)
    assert json_response["success"]
    assert_not_nil json_response["data"]["tarot_card_id"]
    assert_includes 1..78, json_response["data"]["tarot_card_id"]
    assert_equal Date.today.to_s, json_response["data"]["drawn_on"]
    assert_equal false, json_response["data"]["opened"]
  end

  test "should return existing daily card on subsequent requests today" do
    # Create the card for today first
    card = @user.user_daily_cards.create!(tarot_card_id: 42, drawn_on: Date.today, opened: true)

    assert_no_difference -> { @user.user_daily_cards.count } do
      get api_v1_user_daily_card_url(user_id: @user.id), as: :json
    end

    assert_response :success
    json_response = JSON.parse(response.body)
    assert json_response["success"]
    assert_equal 42, json_response["data"]["tarot_card_id"]
    assert_equal Date.today.to_s, json_response["data"]["drawn_on"]
    assert_equal true, json_response["data"]["opened"]
  end

  test "should reveal daily card" do
    card = @user.user_daily_cards.create!(tarot_card_id: 42, drawn_on: Date.today, opened: false)

    post reveal_api_v1_user_daily_card_url(user_id: @user.id), as: :json
    assert_response :success

    json_response = JSON.parse(response.body)
    assert json_response["success"]
    assert_equal true, json_response["data"]["opened"]
    assert_equal 42, json_response["data"]["tarot_card_id"]

    assert card.reload.opened
  end

  test "should return error if trying to reveal non-existent card" do
    post reveal_api_v1_user_daily_card_url(user_id: @user.id), as: :json
    # Since POST reveal automatically tries to find daily card, if none exists, it doesn't automatically draw?
    # Wait, in the controller:
    # @daily_card = @user.user_daily_cards.find_by(drawn_on: Date.today)
    # if @daily_card ... else ... returns not_found
    assert_response :not_found
  end

  test "should return not found/error if user does not exist" do
    get api_v1_user_daily_card_url(user_id: 999999), as: :json
    assert_response :not_found
  end
end
