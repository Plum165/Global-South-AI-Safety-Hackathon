type Level = 'info' | 'warn' | 'error' | 'debug';

function log(level: Level, message: string, data?: unknown): void {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase().padEnd(5)}]`;
  const output = `${prefix} ${message}`;
  if (level === 'error') {
    console.error(output, data !== undefined ? data : '');
  } else if (level === 'warn') {
    console.warn(output, data !== undefined ? data : '');
  } else {
    console.log(output, data !== undefined ? data : '');
  }
}

export const logger = {
  info:  (msg: string, data?: unknown) => log('info',  msg, data),
  warn:  (msg: string, data?: unknown) => log('warn',  msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
  debug: (msg: string, data?: unknown) => log('debug', msg, data),
};
