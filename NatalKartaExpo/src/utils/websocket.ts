import { ENV } from '../config/api';

export const getWebSocketUrl = (userId: number | string): string => {
  const baseUrl = ENV.API_BASE_URL;
  const rootUrl = baseUrl.replace('/api/v1', '/cable');
  const wsUrl = rootUrl.replace(/^http/, 'ws');
  return `${wsUrl}?user_id=${userId}`;
};
