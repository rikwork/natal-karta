export interface User {
  id: number;
  name: string;
  email: string;
  subscription_type: 'free' | 'premium';
  subscription_expires_at?: string;
  birth_data_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NatalChartData {
  short_summary?: string;
  identity: string;
  emotions?: string;
  love_preview: string;
  love_locked: string | null;
  career_preview: string;
  career_locked: string | null;
}

export interface NatalChart {
  id: number;
  user_id: number;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number;
  longitude: number;
  chart_data?: NatalChartData | string;
  created_at: string;
  updated_at: string;
}

export interface DailyPredictionContent {
  energy: string;
  mood: string;
  love: string;
  career: string;
  recommendations: string[];
  warnings: string[];
  lucky_number: number;
  lucky_color: string;
}

export interface DailyPrediction {
  id: number;
  user_id: number;
  prediction_date: string;
  content: string | DailyPredictionContent;
  created_at: string;
  updated_at: string;
}

export interface BirthData {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number;
  longitude: number;
}

export interface City {
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  population: number;
  admin_name1?: string;
  admin_name2?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  message?: string;
  error?: string;
}
