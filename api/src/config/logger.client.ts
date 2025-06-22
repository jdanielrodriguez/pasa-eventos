type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, ...args: any[]) {
  const now = new Date().toISOString();
  console[level === 'error' ? 'error' : level](`[${now}] [${level.toUpperCase()}]`, ...args);
}

export const logger = {
  info: (...args: any[]) => log('info', ...args),
  warn: (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
  debug: (...args: any[]) => log('debug', ...args),
};
