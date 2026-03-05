# frozen_string_literal: true

class CreateDailyPredictions < ActiveRecord::Migration[8.0]
  def change
    create_table :daily_predictions do |t|
      t.references :user, null: false, foreign_key: true
      t.date :prediction_date
      t.text :content

      t.timestamps
    end
  end
end
