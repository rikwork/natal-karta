# frozen_string_literal: true

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      resources :users do
        resources :natal_charts do
          member do
            post :generate
          end
        end
        resources :daily_predictions do
          collection do
            get :show, path: "show/:date"
            post :generate_today
          end
        end
      end

      resources :error_logs do
        collection do
          get :stats
        end
      end

      resources :cities, only: [] do
        collection do
          get :search
        end
      end
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
