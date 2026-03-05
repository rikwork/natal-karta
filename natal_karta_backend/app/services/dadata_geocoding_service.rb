# frozen_string_literal: true

require "net/http"
require "uri"
require "json"

class DadataGeocodingService
  DADATA_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address"
  
  def self.search_cities(query, language = "ru", max_rows = 5)
    new(query, language, max_rows).search_cities
  end

  def initialize(query, language = "ru", max_rows = 5)
    @query = query
    @language = language
    @max_rows = max_rows
    @api_token = "24c41d33b25a8e062137db1d5a5318bb1c8ccccd"
  end

  def search_cities
    return [] if @query.to_s.strip.length < 2

    cache_key = "dadata_search_#{@query.downcase.strip}_#{@max_rows}"
    
    Rails.cache.fetch(cache_key, expires_in: 24.hours) do
      perform_dadata_request
    end
  rescue => e
    Rails.logger.error "DaData Service Error: #{e.message}"
    []
  end

  private

  def perform_dadata_request
    uri = URI.parse(DADATA_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 5

    request = Net::HTTP::Post.new(uri.path)
    request["Content-Type"] = "application/json"
    request["Accept"] = "application/json"
    request["Authorization"] = "Token #{@api_token}"

    body = {
      query: @query,
      from_bound: { value: "city" },
      to_bound: { value: "settlement" },
      count: @max_rows
    }

    request.body = body.to_json
    response = http.request(request)

    if response.is_a?(Net::HTTPSuccess)
      parse_results(JSON.parse(response.body))
    else
      Rails.logger.error "DaData API Error: #{response.code} - #{response.body}"
      []
    end
  end

  def parse_results(data)
    suggestions = data["suggestions"] || []
    
    suggestions.map do |s|
      d = s["data"]
      next if d["city"].blank? && d["settlement"].blank?

      # Координаты в DaData могут быть строками или числами
      lat = d["geo_lat"].to_f
      lon = d["geo_lon"].to_f
      
      # Если координат нет, такой город нам не подходит для натальной карты
      next if lat == 0.0 || lon == 0.0

      name = d["city"] || d["settlement"]
      
      {
        name: name,
        country: d["country"] || "Россия",
        country_code: d["country_iso_code"]&.downcase || "ru",
        latitude: lat,
        longitude: lon,
        admin_name1: d["region_with_type"],
        admin_name2: d["area_with_type"],
        display_name: s["value"],
        importance: calculate_importance(d)
      }
    end.compact
  end

  def calculate_importance(data)
    # DaData не дает importance напрямую, симулируем по типу населенного пункта
    return 1.0 if data["city_type_full"] == "город"
    return 0.7 if data["settlement_type_full"] == "поселок" || data["settlement_type_full"] == "село"
    0.5
  end
end
