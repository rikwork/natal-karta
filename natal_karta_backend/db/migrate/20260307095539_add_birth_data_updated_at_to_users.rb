# frozen_string_literal: true

class AddBirthDataUpdatedAtToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :birth_data_updated_at, :datetime
  end
end
