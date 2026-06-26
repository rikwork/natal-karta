class CreatePartnerCompatibilities < ActiveRecord::Migration[8.0]
  def change
    create_table :partner_compatibilities do |t|
      t.references :user, null: false, foreign_key: true
      t.string :partner_name, null: false
      t.date :partner_birth_date, null: false
      t.time :partner_birth_time
      t.string :partner_birth_place, null: false
      t.decimal :partner_latitude, precision: 10, scale: 6
      t.decimal :partner_longitude, precision: 10, scale: 6
      t.text :compatibility_data

      t.timestamps
    end
  end
end
