import errorReporter from '../services/errorReporter';

export const setupErrorHandlers = () => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);

    // Ищем объект Error среди всех переданных аргументов
    const errorObj = args.find((arg) => arg instanceof Error);
    if (errorObj) {
      errorReporter.reportError(errorObj, 'Console Error');
    } else if (args.length > 0) {
      // Если переданы только строки/объекты, собираем их в один Error
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      errorReporter.reportError(new Error(message), 'Console Error (String)');
    }
  };

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('unhandledrejection', (event: any) => {
      const error = new Error(event.reason || 'Unhandled Promise Rejection');
      errorReporter.reportError(error, 'Unhandled Promise Rejection');
    });
  }

  // Hermes unhandled promise rejection tracking for mobile
  // @ts-ignore
  if (global.HermesInternal?.enablePromiseRejectionTracker) {
    // @ts-ignore
    global.HermesInternal.enablePromiseRejectionTracker({
      allRejections: true,
      onUnhandled: (id: string, error: any) => {
        errorReporter.reportError(
          error instanceof Error ? error : new Error(String(error)),
          'Unhandled Promise Rejection (Hermes)',
        );
      },
    });
  }

  // @ts-ignore
  if (typeof ErrorUtils !== 'undefined') {
    // @ts-ignore
    const originalHandler = ErrorUtils.getGlobalHandler();
    // @ts-ignore
    ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean | undefined) => {
      errorReporter.reportError(
        error,
        `React Native Global Handler (isFatal: ${isFatal || false})`,
      );
      if (originalHandler) originalHandler(error, isFatal || false);
    });
  }
};
