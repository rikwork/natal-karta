# frozen_string_literal: true

module Api
  module V1
    class PartnerCompatibilitiesController < ApplicationController
      before_action :set_user
      before_action :set_partner_compatibility, only: [:show, :generate, :destroy]

      def index
        @compatibilities = @user.partner_compatibilities.recent
        render json: @compatibilities.map { |comp| PartnerCompatibilitySerializer.new(comp).as_json }
      end

      def show
        render json: PartnerCompatibilitySerializer.new(@partner_compatibility).as_json
      end

      def create
        unless @user.natal_charts.exists?
          render json: { error: 'Для расчёта совместимости необходима натальная карта' },
                 status: :unprocessable_entity
          return
        end

        @partner_compatibility = @user.partner_compatibilities.build(partner_compatibility_params)

        if @partner_compatibility.save
          GeneratePartnerCompatibilityJob.perform_later(@user.id, @partner_compatibility.id, user_locale)
          render json: PartnerCompatibilitySerializer.new(@partner_compatibility).as_json, status: :created
        else
          render json: { errors: @partner_compatibility.errors }, status: :unprocessable_entity
        end
      end

      def generate
        if @partner_compatibility.compatibility_data.present?
          render json: PartnerCompatibilitySerializer.new(@partner_compatibility).as_json
        else
          GeneratePartnerCompatibilityJob.perform_later(@user.id, @partner_compatibility.id, user_locale)
          render json: { status: 'processing', id: @partner_compatibility.id }, status: :accepted
        end
      end

      def destroy
        @partner_compatibility.destroy
        head :no_content
      end

      private

      def set_user
        @user = User.find(params[:user_id])
      end

      def set_partner_compatibility
        @partner_compatibility = @user.partner_compatibilities.find(params[:id])
      end

      def partner_compatibility_params
        params.expect(
          partner_compatibility: [:partner_name, :partner_birth_date, :partner_birth_time,
                                  :partner_birth_place, :partner_latitude, :partner_longitude]
        )
      end
    end
  end
end
