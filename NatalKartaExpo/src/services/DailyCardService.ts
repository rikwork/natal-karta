import { ENV } from '../config/api';

const API_BASE_URL = ENV.API_BASE_URL;

export interface DailyCardResponse {
  success: boolean;
  data?: {
    tarot_card_id: number;
    drawn_on: string;
  };
  error?: string;
}

export const DailyCardService = {
  getDailyCard: async (userId: number): Promise<DailyCardResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/daily_card`);
      const data = await response.json();
      
      // Ensure we match the expected format
      if (data && data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error || 'Failed to fetch' };
    } catch (error) {
      console.error('Error fetching daily card:', error);
      return { success: false, error: 'Failed to fetch daily card' };
    }
  }
};
