class CreateErrorLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :error_logs do |t|
      t.string :level
      t.text :message
      t.string :component
      t.datetime :timestamp
      t.integer :user_id
      t.text :device_info
      t.text :stack
      t.text :additional_data

      t.timestamps
    end
  end
end
