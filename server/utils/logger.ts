/**
 * Structured Logger for Elsa3ed Market (سوق الصعيد)
 * Formats logs with timestamps, levels, request correlation IDs, and automatic secret redaction.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'auth_secret',
  'gemini_api_key',
  'authorization',
  'cookie',
  'cvv',
  'cardnumber',
  'receipt_url'
];

function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export class Logger {
  private static formatMessage(level: LogLevel, message: string, meta?: any, requestId?: string): string {
    const timestamp = new Date().toISOString();
    const reqTag = requestId ? ` [Req: ${requestId}]` : '';
    const metaStr = meta ? ` | Meta: ${JSON.stringify(redactSensitiveData(meta))}` : '';
    return `[${timestamp}] [${level}]${reqTag} ${message}${metaStr}`;
  }

  static info(message: string, meta?: any, requestId?: string) {
    console.log(this.formatMessage('INFO', message, meta, requestId));
  }

  static warn(message: string, meta?: any, requestId?: string) {
    console.warn(this.formatMessage('WARN', message, meta, requestId));
  }

  static error(message: string, error?: any, requestId?: string) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined }
      : error;
    console.error(this.formatMessage('ERROR', message, errorDetails, requestId));
  }

  static audit(message: string, meta?: any, requestId?: string) {
    console.log(this.formatMessage('AUDIT', message, meta, requestId));
  }

  static debug(message: string, meta?: any, requestId?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('DEBUG', message, meta, requestId));
    }
  }
}
