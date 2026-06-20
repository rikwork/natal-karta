import { Platform } from 'react-native';

const getDevApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api/v1';
  }
  return 'https://3a67-185-204-53-72.ngrok-free.app/api/v1';
};

export const ENV = {
  // To test on a real device, change API_BASE_URL to your local network IP (e.g., 'http://192.168.1.5:3000')
  // For production, change this to your deployed backend URL.
  API_BASE_URL: __DEV__ ? getDevApiBaseUrl() : 'https://your-production-url.com/api/v1',
};
