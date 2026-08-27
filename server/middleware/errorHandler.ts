import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.ts';
import { RequestWithId } from './requestId.ts';

export function errorHandler(
  err: any,
  req: RequestWithId,
  res: Response,
  next: NextFunction
) {
  const requestId = req.id || 'req_unknown';
  const statusCode = err.status || err.statusCode || 500;

  // Log full error details securely on the server
  Logger.error(
    `[Unhandled Error] ${req.method} ${req.originalUrl || req.url} failed with status ${statusCode}: ${err.message}`,
    {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    },
    requestId
  );

  // Return clean, dignified Arabic message to user without leaking internals
  const userMessage =
    statusCode === 400
      ? err.message || 'بيانات الطلب غير مكتملة أو غير صحيحة'
      : statusCode === 401
      ? 'غير مصرح لك بالوصول. يرجى تسجيل الدخول'
      : statusCode === 403
      ? 'ليس لديك الصلاحيات الكافية للقيام بهذا الإجراء'
      : statusCode === 404
      ? 'العنصر أو المسار المطلوب غير موجود'
      : statusCode === 429
      ? 'تم تجاوز الحد المسموح من الطلبات، يرجى الانتظار قليلاً'
      : 'حدث خطأ غير متوقع في الخادم، جاري معالجة الأمر';

  res.status(statusCode).json({
    success: false,
    error: userMessage,
    code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
    requestId
  });
}
