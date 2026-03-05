# frozen_string_literal: true

class Users::Update
  def self.call(user, params)
    new(user, params).call
  end

  def initialize(user, params)
    @user = user
    @params = params
  end

  def call
    if @user.update(@params)
      { success: true, data: @user }
    else
      { success: false, errors: @user.errors }
    end
  end
end
