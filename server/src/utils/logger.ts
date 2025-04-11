/**
 * Logger utility for consistent logging across the application
 */

// Format the current timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Format the log message
const formatMessage = (level: string, message: string): string => {
  return `[${getTimestamp()}] [${level}] ${message}`;
};

// Format error objects for better logging
const formatError = (error: any): any => {
  if (!error) return '';

  // If it's already a string, return it
  if (typeof error === 'string') return error;

  // If it's an Error object, extract useful properties
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ...(error as any)
    };
  }

  // Otherwise, return the object as is
  return error;
};

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(formatMessage('INFO', message), meta ? meta : '');
  },

  error: (message: string, error?: any) => {
    console.error(formatMessage('ERROR', message), formatError(error));
  },

  warn: (message: string, meta?: any) => {
    console.warn(formatMessage('WARN', message), meta ? meta : '');
  },

  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('DEBUG', message), meta ? meta : '');
    }
  },

  // Log HTTP requests
  http: (req: any, res: any, responseTime?: number) => {
    const { method, url, ip, body } = req;
    const statusCode = res.statusCode;
    const userAgent = req.headers['user-agent'] || '';

    const message = `${method} ${url} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`;

    // Log request body for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      if (method === 'POST' || method === 'PUT') {
        console.log('Request body:', JSON.stringify(body, null, 2));
      }
    }

    // Log with appropriate level based on status code
    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  }
};
