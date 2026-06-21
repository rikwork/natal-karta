class Api::V1::DailyCardsController < ApplicationController
  before_action :set_user

  def show
    @daily_card = @user.user_daily_cards.find_by(drawn_on: Date.today)

    unless @daily_card
      # Randomly select a card ID (1-78) from the full Tarot deck
      random_id = rand(1..78)
      @daily_card = @user.user_daily_cards.create!(
        tarot_card_id: random_id,
        drawn_on: Date.today,
        opened: false
      )
    end

    render json: {
      success: true,
      data: {
        tarot_card_id: @daily_card.tarot_card_id,
        drawn_on: @daily_card.drawn_on,
        opened: @daily_card.opened
      }
    }
  rescue ActiveRecord::RecordInvalid => e
    render json: { success: false, error: e.message }, status: :unprocessable_entity
  end

  def reveal
    @daily_card = @user.user_daily_cards.find_by(drawn_on: Date.today)

    if @daily_card
      @daily_card.update!(opened: true)
      render json: {
        success: true,
        data: {
          tarot_card_id: @daily_card.tarot_card_id,
          drawn_on: @daily_card.drawn_on,
          opened: @daily_card.opened
        }
      }
    else
      render json: { success: false, error: "Daily card not found for today" }, status: :not_found
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { success: false, error: e.message }, status: :unprocessable_entity
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  end
end
