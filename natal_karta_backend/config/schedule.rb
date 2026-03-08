set :output, "log/cron_log.log"

# Генерируем гороскопы на завтра каждый день в 22:00
every 1.day, at: '10:00 pm' do
  rake "zodiac:generate_all"
end

# Очищаем старые гороскопы каждый день в 03:00
every 1.day, at: '3:00 am' do
  rake "zodiac:cleanup"
end
