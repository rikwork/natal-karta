# frozen_string_literal: true

class CreateNatalCharts < ActiveRecord::Migration[8.0]
  def change
    create_table :natal_charts do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name
      t.date :birth_date
      t.time :birth_time
      t.string :birth_place
      t.decimal :latitude
      t.decimal :longitude
      t.text :chart_data

      t.timestamps
    end
  end
end
