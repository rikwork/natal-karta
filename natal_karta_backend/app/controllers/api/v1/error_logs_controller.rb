class Api::V1::ErrorLogsController < ApplicationController
  before_action :set_error_log, only: [ :show, :update, :destroy ]

  # GET /api/v1/error_logs
  def index
    @error_logs = ErrorLog.order(created_at: :desc).limit(100)
    render json: {
      data: @error_logs,
      message: "Error logs retrieved successfully"
    }
  end

  # GET /api/v1/error_logs/1
  def show
    render json: {
      data: @error_log,
      message: "Error log retrieved successfully"
    }
  end

  # POST /api/v1/error_logs
  def create
    @error_log = ErrorLog.new(error_log_params)

    if @error_log.save
      render json: {
        data: @error_log,
        message: "Error log created successfully"
      }, status: :created
    else
      render json: {
        error: @error_log.errors.full_messages.join(", "),
        message: "Failed to create error log"
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/error_logs/1
  def update
    if @error_log.update(error_log_params)
      render json: {
        data: @error_log,
        message: "Error log updated successfully"
      }
    else
      render json: {
        error: @error_log.errors.full_messages.join(", "),
        message: "Failed to update error log"
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/error_logs/1
  def destroy
    @error_log.destroy
    render json: {
      message: "Error log deleted successfully"
    }
  end

  # GET /api/v1/error_logs/stats
  def stats
    stats = {
      total_errors: ErrorLog.count,
      errors_by_level: ErrorLog.group(:level).count,
      errors_by_component: ErrorLog.group(:component).count,
      recent_errors: ErrorLog.where("created_at > ?", 24.hours.ago).count,
      top_errors: ErrorLog.group(:message).count.sort_by { |k, v| -v }.first(10)
    }

    render json: {
      data: stats,
      message: "Error statistics retrieved successfully"
    }
  end

  private

  def set_error_log
    @error_log = ErrorLog.find(params[:id])
  end

  def error_log_params
    params.require(:error_log).permit(
      :level, :message, :component, :timestamp, :user_id,
      :device_info, :stack, :additional_data
    )
  end
end
