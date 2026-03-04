require_relative 'config/environment'

user = User.first
chart = user.natal_charts.first

if chart.chart_data
  puts "Testing serializer..."
  puts JSON.pretty_generate(NatalChartSerializer.new(chart).as_json)
else
  puts "No chart data found to serialize"
end
