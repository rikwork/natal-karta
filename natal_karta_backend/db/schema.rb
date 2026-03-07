# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_03_07_095539) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "daily_predictions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "prediction_date"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_daily_predictions_on_user_id"
  end

  create_table "error_logs", force: :cascade do |t|
    t.string "level"
    t.text "message"
    t.string "component"
    t.datetime "timestamp"
    t.integer "user_id"
    t.text "device_info"
    t.text "stack"
    t.text "additional_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "natal_charts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name"
    t.date "birth_date"
    t.time "birth_time"
    t.string "birth_place"
    t.decimal "latitude"
    t.decimal "longitude"
    t.text "chart_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_natal_charts_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "subscription_type"
    t.datetime "subscription_expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "firebase_uid"
    t.datetime "birth_data_updated_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["firebase_uid"], name: "index_users_on_firebase_uid"
  end

  add_foreign_key "daily_predictions", "users"
  add_foreign_key "natal_charts", "users"
end
