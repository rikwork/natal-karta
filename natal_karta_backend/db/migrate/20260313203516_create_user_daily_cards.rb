class CreateUserDailyCards < ActiveRecord::Migration[8.0]
  def change
    create_table :user_daily_cards do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :tarot_card_id
      t.date :drawn_on

      t.timestamps
    end
    add_index :user_daily_cards, :drawn_on
  end
end
