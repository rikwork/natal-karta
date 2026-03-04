require "net/http"
require "uri"
require "json"

class PhotonGeocodingService
  PHOTON_BASE_URL = "https://photon.komoot.io"
  USER_AGENT = "NatalKartaApp/1.0"

  def self.search_cities(query, language = "ru", max_rows = 5)
    new(query, language, max_rows).search_cities
  end

  def initialize(query, language = "ru", max_rows = 5)
    @query = query
    @language = language
    @max_rows = max_rows
  end

  def search_cities
    return [] if @query.to_s.strip.length < 2

    begin
      query = @query.to_s.strip
      results = photon_search(query)
      format_results(results)
    rescue => e
      Rails.logger.error "Photon API error: #{e.message}"
      []
    end
  end

  private

  def photon_search(query)
    # Кэшируем результаты на 1 час
    cache_key = "photon_search_#{@language}_#{query.downcase.strip}_#{@max_rows}"
    
    Rails.cache.fetch(cache_key, expires_in: 1.hour) do
      perform_photon_request(query)
    end
  end

  def perform_photon_request(query)
    uri = URI.parse("#{PHOTON_BASE_URL}/api")
    
    params = {
      "q" => query,
      "limit" => [@max_rows.to_i, 20].max,
      "osm_tag" => "place:city,place:town,place:village"
    }
    
    # Photon поддерживает только en, de, fr - используем en для международных запросов
    params["lang"] = "en" if @language == "en"
    
    uri.query = URI.encode_www_form(params)
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 3  # Photon очень быстрый
    http.open_timeout = 2  # Photon очень быстрый
    
    request = Net::HTTP::Get.new(uri)
    request['User-Agent'] = USER_AGENT
    request['Accept'] = 'application/json'
    
    response = http.request(request)

    if response.is_a?(Net::HTTPSuccess)
      data = JSON.parse(response.body)
      data["features"] || []
    else
      Rails.logger.error "Photon HTTP error: #{response.code} #{response.message}"
      []
    end
  rescue Net::TimeoutError => e
    Rails.logger.error "Photon timeout: #{e.message}"
    []
  rescue StandardError => e
    Rails.logger.error "Photon request error: #{e.message}"
    []
  end

  def format_results(features)
    return [] unless features.is_a?(Array)

    features.map do |feature|
      properties = feature["properties"] || {}
      coordinates = feature["geometry"]&.dig("coordinates") || [0, 0]
      
      {
        name: properties["name"],
        country: properties["country"],
        country_code: properties["countrycode"]&.downcase,
        latitude: coordinates[1].to_f,
        longitude: coordinates[0].to_f,
        population: 0, # Photon не предоставляет данные о населении
        admin_name1: properties["state"],
        admin_name2: properties["county"],
        display_name: build_display_name(properties),
        importance: calculate_importance(properties)
      }
    end.sort_by { |city| -city[:importance] }
  end

  def build_display_name(properties)
    parts = []
    parts << properties["name"] if properties["name"]
    parts << properties["state"] if properties["state"]
    parts << properties["country"] if properties["country"]
    parts.join(", ")
  end

  def calculate_importance(properties)
    # Приоритет: city > town > village
    case properties["osm_value"]
    when "city"
      1.0
    when "town"
      0.7
    when "village"
      0.4
    else
      0.1
    end
  end
end
