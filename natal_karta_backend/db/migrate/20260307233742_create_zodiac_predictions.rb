class CreateZodiacPredictions < ActiveRecord::Migration[8.0]
  def change
    create_table :zodiac_predictions do |t|
      t.string :sign
      t.string :period
      t.date :prediction_date
      t.text :content

      t.timestamps
    end
  end
end
