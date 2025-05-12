import pino from 'pino';

const transport = 
  process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      }
    : undefined;

export const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  browser: {
    write: {
      info: (...args) => console.info(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args),
      debug: (...args) => console.debug(...args),
      trace: (...args) => console.trace(...args),
    }
  },
  ...(typeof window === 'undefined' && { transport }),
});

// Previne erros no cliente
if (typeof window !== 'undefined') {
  logger.level = 'silent';
} 