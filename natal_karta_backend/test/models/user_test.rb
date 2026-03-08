# frozen_string_literal: true

require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "zodiac_sign calculation" do
    user = User.create!(name: "Test User", email: "test@example.com")
    
    # Aries
    chart = user.natal_charts.create!(name: "Aries", birth_date: "1990-03-21", birth_time: "12:00", birth_place: "Moscow", latitude: 55.75, longitude: 37.61)
    assert_equal "Овен", user.zodiac_sign
    
    # Scorpio
    chart.update!(birth_date: "1990-11-15")
    assert_equal "Скорпион", user.zodiac_sign
    
    # Capricorn (edge case Dec 22)
    chart.update!(birth_date: "1990-12-22")
    assert_equal "Козерог", user.zodiac_sign
    
    # Capricorn (edge case Jan 19)
    chart.update!(birth_date: "1991-01-19")
    assert_equal "Козерог", user.zodiac_sign
    
    # Aquarius (Jan 20)
    chart.update!(birth_date: "1991-01-20")
    assert_equal "Водолей", user.zodiac_sign
  end
end
