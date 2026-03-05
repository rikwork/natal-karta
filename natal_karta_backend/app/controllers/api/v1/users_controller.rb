class Api::V1::UsersController < ApplicationController
  before_action :set_user, only: [ :show, :update, :destroy ]

  def index
    @users = User.all
    render json: @users.map { |user| UserSerializer.new(user).as_json }
  end

  def show
    render json: UserSerializer.new(@user).as_json
  end

  def create
    result = Users::Create.call(user_params)

    if result[:success]
      render json: UserSerializer.new(result[:data]).as_json, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    result = Users::Update.call(@user, user_params)

    if result[:success]
      render json: UserSerializer.new(result[:data]).as_json
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:name, :email, :subscription_type, :subscription_expires_at)
  end
end
