class AddOpenedToUserDailyCards < ActiveRecord::Migration[8.0]
  def change
    add_column :user_daily_cards, :opened, :boolean, default: false, null: false
  end
end
