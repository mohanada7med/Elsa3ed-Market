import type { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.ts';
import type { RequestWithId } from './requestId.ts';

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

  // Return clean, warm Egyptian Arabic message to user without leaking internals
  const userMessage =
    statusCode === 400
      ? err.message || 'بيانات الطلب ناقصة أو فيها حاجة مش مظبوطة'
      : statusCode === 401
      ? 'سجّل دخولك الأول عشان تقدر تكمل'
      : statusCode === 403
      ? 'معندكش صلاحية تعمل الخطوة دي'
      : statusCode === 404
      ? 'الحاجة أو الصفحة اللي بتدور عليها مش موجودة'
      : statusCode === 413 || err.type === 'entity.too.large'
      ? 'حجم الملف أو الفيديو كبير شوية، اختار ملف حجمه أصغر'
      : statusCode === 429
      ? 'ضغط طلبات كتير ورا بعض، استنى ثواني وجرب تاني'
      : 'حصلت مشكلة غير متوقعة وإحنا بنعالج الموضوع دلوقتي';

  res.status(statusCode).json({
    success: false,
    error: userMessage,
    code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
    requestId
  });
}
