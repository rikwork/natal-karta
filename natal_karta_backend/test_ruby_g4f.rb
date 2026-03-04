require_relative 'config/environment'

user = User.first || User.create!(name: "Test User", email: "test@example.com")
chart = user.natal_charts.first || user.natal_charts.create!(name: "Test", birth_date: "1991-01-01", birth_time: "12:00", birth_place: "Moscow", latitude: 55.7558, longitude: 37.6173)

puts "Testing chart generation for #{chart.name}..."
result = NatalCharts::Generate.call(user, chart)
puts result.inspect
