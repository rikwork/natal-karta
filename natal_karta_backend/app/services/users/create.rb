# frozen_string_literal: true

class Users::Create
  def self.call(params)
    new(params).call
  end

  def initialize(params)
    @params = params
  end

  def call
    # If user already exists by firebase_uid or email (e.g. from a previous anonymous session),
    # just return the existing user instead of failing with 422 Unprocessable Entity
    existing_user = find_existing_user

    return { success: true, data: existing_user } if existing_user

    user = User.new(@params)

    if user.save
      { success: true, data: user }
    else
      { success: false, errors: user.errors }
    end
  end

  private

  def find_existing_user
    user = nil
    user = User.find_by(firebase_uid: @params[:firebase_uid]) if @params[:firebase_uid].present?
    user ||= User.find_by(email: @params[:email]) if @params[:email].present?

    # Backward compatibility: if user was found by email but lacks firebase_uid, update it
    if user && user.firebase_uid.nil? && @params[:firebase_uid].present?
      user.update(firebase_uid: @params[:firebase_uid])
    end

    user
  end
end
