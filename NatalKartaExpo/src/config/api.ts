export const ENV = {
  // To test on a real device, change API_BASE_URL to your local network IP (e.g., 'http://192.168.1.5:3000')
  // For production, change this to your deployed backend URL.
  // API_BASE_URL: 'http://192.168.1.5:3000/api/v1',
  API_BASE_URL: __DEV__ ? 'http://localhost:3000/api/v1' : 'https://your-production-url.com/api/v1',
};
