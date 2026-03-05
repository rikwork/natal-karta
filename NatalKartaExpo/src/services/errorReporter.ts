// Простая система отправки ошибок на сервер
class ErrorReporter {
  private static instance: ErrorReporter;
  private apiUrl = 'http://192.168.1.5:3000/api/v1/error_logs';

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  async reportError(error: Error, context?: string) {
    try {
      const errorData = {
        error_log: {
          message: error.message,
          stack: error.stack,
          component: context || 'React Native App',
          level: 'error',
          device_info: 'React Native',
          additional_data: JSON.stringify({ url: 'mobile_app' }),
          timestamp: new Date().toISOString(),
        },
      };

      console.log('Sending error to server:', errorData);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      });

      if (response.ok) {
        console.log('Error sent successfully');
      } else {
        console.log('Failed to send error:', response.status, response.statusText);
      }
    } catch (reportError) {
      console.log('Error sending error report:', reportError);
    }
  }
}

export default ErrorReporter.getInstance();
