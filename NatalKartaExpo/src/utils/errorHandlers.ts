import errorReporter from '../services/errorReporter';

export const setupErrorHandlers = () => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
        originalConsoleError(...args);
        if (args[0] instanceof Error) {
            errorReporter.reportError(args[0], 'Console Error');
        }
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('unhandledrejection', (event: any) => {
            const error = new Error(event.reason || 'Unhandled Promise Rejection');
            errorReporter.reportError(error, 'Unhandled Promise Rejection');
        });
    }

    // @ts-ignore
    if (typeof ErrorUtils !== 'undefined') {
        // @ts-ignore
        const originalHandler = ErrorUtils.getGlobalHandler();
        // @ts-ignore
        ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean | undefined) => {
            errorReporter.reportError(error, `React Native Global Handler (isFatal: ${isFatal || false})`);
            if (originalHandler) originalHandler(error, isFatal || false);
        });
    }
};
