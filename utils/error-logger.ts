// Error logging utility for CreditSea application
// This provides a centralized way to log errors with consistent formatting

// Log level enum
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  url?: string;
  stackTrace?: string;
}

/**
 * Error Logger class that handles sending logs to appropriate destination
 * (console, server, monitoring service, etc.)
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOCAL_LOGS = 100;
  private apiEndpoint?: string;
  private isDebugMode: boolean;
  
  private constructor() {
    this.isDebugMode = process.env.NODE_ENV !== 'production';
    this.apiEndpoint = process.env.NEXT_PUBLIC_ERROR_LOGGING_ENDPOINT;
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }
  
  /**
   * Log an error
   */
  public logError(error: unknown, context?: Record<string, any>, level: LogLevel = LogLevel.ERROR): void {
    const errorMessage = this.formatErrorMessage(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;
    
    // Create log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: errorMessage,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stackTrace,
    };
    
    // Store locally
    this.addToLocalLogs(logEntry);
    
    // Log to console in development
    if (this.isDebugMode) {
      this.logToConsole(logEntry);
    }
    
    // Send to server if endpoint configured
    if (this.apiEndpoint) {
      this.sendToServer(logEntry).catch(console.error);
    }
  }
  
  /**
   * Format error message from different error types
   */
  private formatErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return `Unknown error: ${JSON.stringify(error)}`;
  }
  
  /**
   * Add log to local storage (with size limit)
   */
  private addToLocalLogs(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Prevent logs array from growing too large
    if (this.logs.length > this.MAX_LOCAL_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOCAL_LOGS);
    }
  }
  
  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, context, timestamp } = entry;
    const formattedTimestamp = new Date(timestamp).toLocaleTimeString();
    
    const styles = {
      [LogLevel.INFO]: 'color: #2563EB', // blue
      [LogLevel.WARN]: 'color: #D97706', // amber
      [LogLevel.ERROR]: 'color: #DC2626', // red
      [LogLevel.CRITICAL]: 'color: #7F1D1D; font-weight: bold', // dark red, bold
    };
    
    console.groupCollapsed(
      `%c[${level}]%c ${formattedTimestamp}: ${message}`,
      styles[level],
      'color: inherit'
    );
    
    if (context) {
      console.log('Context:', context);
    }
    
    if (entry.stackTrace) {
      console.log('Stack trace:', entry.stackTrace);
    }
    
    console.groupEnd();
  }
  
  /**
   * Send log to server
   */
  private async sendToServer(entry: LogEntry): Promise<void> {
    if (!this.apiEndpoint) return;
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
        // Don't wait too long to send logs
        signal: AbortSignal.timeout(3000),
      });
      
      if (!response.ok) {
        console.warn('Failed to send error log to server:', response.statusText);
      }
    } catch (err) {
      // Silently fail - don't create logs about failed logs (prevents loops)
      if (this.isDebugMode) {
        console.warn('Failed to send error log to server:', err);
      }
    }
  }
  
  /**
   * Get recent logs (useful for diagnostics)
   */
  public getRecentLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Set user ID for subsequent logs
   */
  public setUserId(userId: string): void {
    // Add user ID to context for all future logs
    this.logs.forEach(log => {
      log.userId = userId;
    });
  }
  
  /**
   * Clear local logs
   */
  public clearLogs(): void {
    this.logs = [];
  }
}

// Create a default logger instance for easy import
const logger = ErrorLogger.getInstance();

// Helper functions for easier use
export function logError(error: unknown, context?: Record<string, any>): void {
  logger.logError(error, context, LogLevel.ERROR);
}

export function logWarning(message: string, context?: Record<string, any>): void {
  logger.logError(message, context, LogLevel.WARN);
}

export function logInfo(message: string, context?: Record<string, any>): void {
  logger.logError(message, context, LogLevel.INFO);
}

export function logCritical(error: unknown, context?: Record<string, any>): void {
  logger.logError(error, context, LogLevel.CRITICAL);
}

// Export default instance
export default logger;
