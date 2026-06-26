# frozen_string_literal: true

require "test_helper"

class PartnerCompatibilityTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
    @partner_compatibility = PartnerCompatibility.new(
      user: @user,
      partner_name: "Test Partner",
      partner_birth_date: Date.today - 25.years,
      partner_birth_place: "Paris",
      partner_latitude: 48.8566,
      partner_longitude: 2.3522
    )
  end

  test "should be valid with valid attributes" do
    assert @partner_compatibility.valid?
  end

  test "should require a partner name" do
    @partner_compatibility.partner_name = ""
    assert_not @partner_compatibility.valid?
  end

  test "should require a partner birth date" do
    @partner_compatibility.partner_birth_date = nil
    assert_not @partner_compatibility.valid?
  end

  test "should require a partner birth place" do
    @partner_compatibility.partner_birth_place = ""
    assert_not @partner_compatibility.valid?
  end
end
