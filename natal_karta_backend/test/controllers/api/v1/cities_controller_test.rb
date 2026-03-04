require "test_helper"
require "minitest/mock"

class Api::V1::CitiesControllerTest < ActionDispatch::IntegrationTest
  test "should get search results" do
    # Mocking the service to avoid real network calls
    mock_results = [{ name: "Moscow", latitude: 55.75, longitude: 37.61 }]
    
    # We use a block-based stub for the class method
    DadataGeocodingService.stub(:search_cities, mock_results) do
      get api_v1_cities_search_url, params: { q: "Mos" }, as: :json
      assert_response :success
      
      json_response = JSON.parse(response.body)
      assert_equal 1, json_response["data"].length
      assert_equal "Moscow", json_response["data"].first["name"]
    end
  end

  test "should return bad request if query is missing" do
    get api_v1_cities_search_url, as: :json
    assert_response :bad_request
  end
end
