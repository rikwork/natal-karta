import { User, NatalChart, DailyPrediction, BirthData, City, ApiResponse } from '../types';
import errorReporter from './errorReporter';
import { ENV } from '../config/api';
import * as Localization from 'expo-localization';

const API_BASE_URL = ENV.API_BASE_URL;

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const locales = Localization.getLocales();
    const languageCode = locales && locales[0] ? locales[0].languageCode : 'ru';

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': languageCode || 'ru',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Ошибка сервера');
      }

      // Normalize response: if the backend didn't wrap the payload in { data: ... }, we do it here.
      // Some endpoints (like cities) return { data: [], message: '...' }.
      // Others (like GET /users/:id) return the raw JSON object { id: 1, name: '...' }.
      if (
        data &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        ('data' in data || 'message' in data || 'error' in data) &&
        Object.keys(data).length <= 3
      ) {
        return data;
      }

      return { data };
    } catch (error) {
      // Отправляем ошибку на сервер
      if (error instanceof Error) {
        errorReporter.reportError(error, `API Request: ${endpoint}`);
      }

      // Возвращаем пустой ответ вместо выброса ошибки
      return {
        data: null as any,
        error: 'Ошибка сети',
      };
    }
  }

  // User methods
  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ user: userData }),
    });
  }

  async getUser(userId: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ user: userData }),
    });
  }

  async deleteUser(userId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Natal Chart methods
  async createNatalChart(userId: number, chartData: BirthData): Promise<ApiResponse<NatalChart>> {
    return this.request<NatalChart>(`/users/${userId}/natal_charts`, {
      method: 'POST',
      body: JSON.stringify({ natal_chart: chartData }),
    });
  }

  async getNatalCharts(userId: number): Promise<ApiResponse<NatalChart[]>> {
    return this.request<NatalChart[]>(`/users/${userId}/natal_charts`);
  }

  async getNatalChart(userId: number, chartId: number): Promise<ApiResponse<NatalChart>> {
    return this.request<NatalChart>(`/users/${userId}/natal_charts/${chartId}`);
  }

  async generateNatalChart(userId: number, chartId: number): Promise<ApiResponse<NatalChart>> {
    return this.request<NatalChart>(`/users/${userId}/natal_charts/${chartId}/generate`, {
      method: 'POST',
    });
  }

  // Daily Prediction methods
  async getDailyPrediction(userId: number, date?: string): Promise<ApiResponse<DailyPrediction>> {
    const endpoint = date
      ? `/users/${userId}/daily_predictions/show/${date}`
      : `/users/${userId}/daily_predictions/show/${new Date().toISOString().split('T')[0]}`;

    return this.request<DailyPrediction>(endpoint);
  }

  async generateDailyPrediction(userId: number): Promise<ApiResponse<DailyPrediction>> {
    return this.request<DailyPrediction>(`/users/${userId}/daily_predictions/generate_today`, {
      method: 'POST',
    });
  }

  async getDailyPredictions(userId: number): Promise<ApiResponse<DailyPrediction[]>> {
    return this.request<DailyPrediction[]>(`/users/${userId}/daily_predictions`);
  }

  async getZodiacPredictions(sign: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ sign });
    return this.request<any>(`/zodiac_predictions?${params}`);
  }

  // Cities methods
  async searchCities(query: string, language: string = 'ru'): Promise<ApiResponse<City[]>> {
    const params = new URLSearchParams({
      q: query,
      language: language,
      max_rows: '20',
    });

    return this.request<City[]>(`/cities/search?${params}`);
  }
}

export default new ApiService();
