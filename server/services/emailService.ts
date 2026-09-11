import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Logger } from '../utils/logger.ts';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface PasswordResetEmailParams {
  to: string;
  userName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

/**
 * Validates and retrieves SMTP configuration from environment variables
 */
function getSmtpConfig() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"WAH | وه" <no-reply@wah-eg.com>';

  const isConfigured = Boolean(host && user && pass);

  return {
    isConfigured,
    host,
    port,
    secure,
    user,
    pass,
    from
  };
}

let transporterInstance: Transporter | null = null;

function getTransporter(): Transporter | null {
  const config = getSmtpConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });
  }

  return transporterInstance;
}

/**
 * Generic email sending function using Nodemailer
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const config = getSmtpConfig();
  const transporter = getTransporter();

  if (!config.isConfigured || !transporter) {
    Logger.warn(
      `[EmailService] SMTP not fully configured in environment. Missing one or more of: SMTP_HOST, SMTP_USER, SMTP_PASS. Simulated email sent to: ${options.to}`
    );
    return {
      success: true,
      simulated: true
    };
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    Logger.info(`[EmailService] Email dispatched successfully to ${options.to}. MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err: any) {
    Logger.error(`[EmailService] Failed to send email to ${options.to}:`, err?.message || err);
    throw new Error('فشل إرسال البريد الإلكتروني، يرجى التحقق من إعدادات الخادم أو المحاولة لاحقاً');
  }
}

/**
 * Builds responsive Arabic HTML template for password reset
 */
export function buildPasswordResetEmailTemplate(params: {
  userName: string;
  resetUrl: string;
  expiresInMinutes: number;
}): { html: string; text: string } {
  const { userName, resetUrl, expiresInMinutes } = params;

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إعادة تعيين كلمة السر - WAH | وه</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f5f0;
      color: #2b251f;
      direction: rtl;
      text-align: right;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f5f0;
      padding: 40px 15px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e8e2d8;
    }
    .header {
      background: linear-gradient(135deg, #211d18 0%, #3d2c1d 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #f7ebd7;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #dfc8a5;
    }
    .body-content {
      padding: 36px 28px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #211d18;
      margin-bottom: 16px;
    }
    .text {
      font-size: 15px;
      line-height: 1.7;
      color: #554d45;
      margin: 0 0 24px 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #9a6a35;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 34px;
      font-size: 16px;
      font-weight: 700;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(154, 106, 53, 0.3);
    }
    .warning-box {
      background-color: #fdf8f0;
      border: 1px solid #faeccf;
      border-radius: 12px;
      padding: 16px;
      margin: 24px 0;
    }
    .warning-text {
      font-size: 13px;
      color: #8c602a;
      line-height: 1.6;
      margin: 0;
    }
    .fallback-box {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #eee7dd;
    }
    .fallback-label {
      font-size: 12px;
      color: #877f76;
      margin-bottom: 6px;
    }
    .fallback-url {
      font-size: 12px;
      word-break: break-all;
      color: #9a6a35;
      direction: ltr;
      text-align: left;
    }
    .footer {
      background-color: #faf8f5;
      padding: 20px 28px;
      text-align: center;
      font-size: 12px;
      color: #999084;
      border-top: 1px solid #eee7dd;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>وه | WAH</h1>
        <p>بوابة الحرف والتراث الصعيدي</p>
      </div>
      <div class="body-content">
        <div class="greeting">أهلاً بك يا ${escapeHtml(userName)}،</div>
        <p class="text">
          استلمنا طلباً لإعادة تعيين كلمة السر الخاصة بحسابك على منصة <strong>وه</strong>.
          اضغط على الزر التالي لإنشاء كلمة سر جديدة ومتابعة استخدام حسابك:
        </p>

        <div class="btn-container">
          <a href="${resetUrl}" class="btn" target="_blank">إعادة تعيين كلمة السر</a>
        </div>

        <div class="warning-box">
          <p class="warning-text">
            ⏱ <strong>تنبيه الأمان:</strong> الرابط صالح للاستخدام مرة واحدة فقط، وينتهي خلال <strong>${expiresInMinutes} دقيقة</strong>.
          </p>
        </div>

        <p class="text" style="font-size: 13px; color: #786f65;">
          إذا لم تكن أنت من طلب إعادة تعيين كلمة السر، فلا تقلق؛ يمكنك تجاهل هذا البريد تماماً وسيظل حسابك محمياً.
        </p>

        <div class="fallback-box">
          <div class="fallback-label">إذا لم يعمل الزر أعلاه، انسخ الرابط التالي والصقه في متصفحك:</div>
          <div class="fallback-url">${resetUrl}</div>
        </div>
      </div>
      <div class="footer">
        منصة وه - مشغولات وتراث من قلب الصعيد | جميع الحقوق محفوظة © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `أهلاً بك يا ${userName}،

استلمنا طلباً لإعادة تعيين كلمة السر الخاصة بحسابك على منصة وه.
يمكنك إعادة تعيين كلمة السر عبر الرابط التالي:
${resetUrl}

الرابط صالح للاستخدام مرة واحدة فقط وينتهي خلال ${expiresInMinutes} دقيقة.
إذا لم تكن أنت من قام بهذا الطلب، يمكنك تجاهل هذه الرسالة بأمان.

فريق عمل منصة وه`;

  return { html, text };
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends a password reset email to the specified user
 */
export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<{ success: boolean; simulated?: boolean }> {
  const expiresInMinutes = params.expiresInMinutes || 30;
  const { html, text } = buildPasswordResetEmailTemplate({
    userName: params.userName,
    resetUrl: params.resetUrl,
    expiresInMinutes
  });

  return sendEmail({
    to: params.to,
    subject: 'إعادة تعيين كلمة السر - منصة وه',
    html,
    text
  });
}
