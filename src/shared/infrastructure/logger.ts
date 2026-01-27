export class Logger {
    static info(message: string, context?: any) {
        console.log(`[INFO] [${new Date().toISOString()}]: ${message}`, context || '');
    }

    static error(message: string, error: Error, context?: any) {
        console.error(`[ERROR] [${new Date().toISOString()}]: ${message}`, {
            error: error.message,
            stack: error.stack,
            context
        });
    }

    static warn(message: string, context?: any) {
        console.warn(`[WARN] [${new Date().toISOString()}]: ${message}`, context || '');
    }
}
