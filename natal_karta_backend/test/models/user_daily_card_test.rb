# frozen_string_literal: true

require "test_helper"

class UserDailyCardTest < ActiveSupport::TestCase
  setup do
    @user = User.create!(name: "Test User", email: "tarot_test@example.com")
  end

  test "should be valid with valid attributes" do
    daily_card = UserDailyCard.new(user: @user, tarot_card_id: 1, drawn_on: Date.today)
    assert daily_card.valid?
  end

  test "should require user" do
    daily_card = UserDailyCard.new(tarot_card_id: 1, drawn_on: Date.today)
    assert_not daily_card.valid?
  end

  test "should require tarot_card_id" do
    daily_card = UserDailyCard.new(user: @user, drawn_on: Date.today)
    assert_not daily_card.valid?
  end

  test "should require drawn_on" do
    daily_card = UserDailyCard.new(user: @user, tarot_card_id: 1)
    assert_not daily_card.valid?
  end

  test "tarot_card_id must be between 1 and 78" do
    # valid boundary values
    assert UserDailyCard.new(user: @user, tarot_card_id: 1, drawn_on: Date.today).valid?
    assert UserDailyCard.new(user: @user, tarot_card_id: 78, drawn_on: Date.today).valid?

    # invalid values
    assert_not UserDailyCard.new(user: @user, tarot_card_id: 0, drawn_on: Date.today).valid?
    assert_not UserDailyCard.new(user: @user, tarot_card_id: 79, drawn_on: Date.today).valid?
    assert_not UserDailyCard.new(user: @user, tarot_card_id: -5, drawn_on: Date.today).valid?
  end

  test "user can only draw one card per day" do
    UserDailyCard.create!(user: @user, tarot_card_id: 10, drawn_on: Date.today)
    
    # second card on same day should be invalid
    duplicate_card = UserDailyCard.new(user: @user, tarot_card_id: 20, drawn_on: Date.today)
    assert_not duplicate_card.valid?
    assert_includes duplicate_card.errors[:user_id], "can only draw one card per day"

    # card on different day should be valid
    tomorrow_card = UserDailyCard.new(user: @user, tarot_card_id: 20, drawn_on: Date.tomorrow)
    assert tomorrow_card.valid?
  end
end
