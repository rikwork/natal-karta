require "test_helper"
require "minitest/mock"

class DadataGeocodingServiceTest < ActiveSupport::TestCase
  test "should return empty array for short query" do
    assert_equal [], DadataGeocodingService.search_cities("a")
  end

  test "should parse dadata response correctly" do
    # Create a mock response
    mock_response = Minitest::Mock.new
    mock_response.expect :is_a?, true, [Net::HTTPSuccess]
    
    mock_body = {
      suggestions: [
        {
          value: "г Москва",
          data: {
            city: "Москва",
            country: "Россия",
            country_iso_code: "RU",
            geo_lat: "55.7558",
            geo_lon: "37.6173",
            region_with_type: "г Москва"
          }
        }
      ]
    }.to_json
    
    mock_response.expect :body, mock_body

    Net::HTTP.stub_any_instance(:request, mock_response) do
      results = DadataGeocodingService.search_cities("Москва")
      assert_equal 1, results.length
      assert_equal "Москва", results.first[:name]
      assert_equal 55.7558, results.first[:latitude]
    end
  end
end
