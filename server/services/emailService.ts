/**
 * WAH | وه
 * Email Service
 *
 * Password Reset Email
 * RTL Arabic / Egyptian Arabic
 *
 * Uses the official WAH Design System tokens:
 * Primary: #9a6a35
 * Secondary: #211d18
 * Background: #eee8dc
 * Background Secondary: #e4ddd1
 * Surface: rgba(255, 255, 255, 0.75)
 * Foreground: #211d18
 * Foreground Secondary: #4a4137
 * Foreground Muted: #6e6255
 */

import dotenv from 'dotenv';
dotenv.config();

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
 * ============================================================
 * WAH DESIGN TOKENS
 * ============================================================
 *
 * نفس ألوان WAH الرسمية الموجودة في Design System.
 */
const WAH_EMAIL = {
  colors: {
    primary: '#9a6a35',
    primaryHover: '#7d5427',
    primaryActive: '#623f1a',
    primaryLight: '#f6ede3',

    secondary: '#211d18',
    secondaryHover: '#362f27',

    background: '#eee8dc',
    backgroundSecondary: '#e4ddd1',
    backgroundTertiary: '#dad2c4',

    surface: 'rgba(255, 255, 255, 0.75)',
    surfaceHover: 'rgba(255, 255, 255, 0.85)',

    foreground: '#211d18',
    foregroundSecondary: '#4a4137',
    foregroundMuted: '#6e6255',

    border: 'rgba(0, 0, 0, 0.1)',
    borderSubtle: 'rgba(0, 0, 0, 0.06)',

    warning: '#C4751B',

    shadow: 'rgba(154, 106, 53, 0.1)',
    terracottaGlow:
      'rgba(154, 106, 53, 0.25)'
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  }
} as const;

/**
 * ============================================================
 * SMTP CONFIG
 * ============================================================
 */
function getSmtpConfig() {
  const host =
    process.env.SMTP_HOST ||
    process.env.EMAIL_HOST;

  const port =
    Number(
      process.env.SMTP_PORT ||
      process.env.EMAIL_PORT
    ) || 587;

  const secure =
    process.env.SMTP_SECURE === 'true' ||
    port === 465;

  const user =
    process.env.SMTP_USER ||
    process.env.EMAIL_USER;

  const pass =
    process.env.SMTP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.EMAIL_PASS;

  const from =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    '"وه | WAH" <no-reply@wah-eg.com>';

  const isConfigured = Boolean(
    host &&
    user &&
    pass
  );

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

/**
 * Cached transporter
 */
let transporterInstance: Transporter | null = null;

/**
 * ============================================================
 * CREATE TRANSPORTER
 * ============================================================
 */
function getTransporter(): Transporter | null {
  const config = getSmtpConfig();

  if (!config.isConfigured) {
    return null;
  }

  if (!transporterInstance) {
    transporterInstance =
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,

        auth: {
          user: config.user,
          pass: config.pass
        },

        tls: {
          rejectUnauthorized:
            process.env.NODE_ENV === 'production'
        }
      });
  }

  return transporterInstance;
}

/**
 * ============================================================
 * SEND GENERIC EMAIL
 * ============================================================
 */
export async function sendEmail(
  options: EmailOptions
): Promise<{
  success: boolean;
  messageId?: string;
  simulated?: boolean;
}> {
  const config = getSmtpConfig();
  const transporter = getTransporter();

  /**
   * SMTP غير مكتمل
   */
  if (!config.isConfigured || !transporter) {
    Logger.warn(
      `[EmailService] SMTP غير مكتمل الإعداد. ` +
      `مطلوب: SMTP_HOST, SMTP_USER, SMTP_PASS. ` +
      `تمت محاكاة إرسال الإيميل إلى: ${options.to}`
    );

    return {
      success: true,
      simulated: true
    };
  }

  try {
    /**
     * مهم:
     *
     * html = نسخة HTML الفعلية
     * text = نسخة نصية احتياطية
     *
     * ممنوع تبديلهم.
     */
    const info =
      await transporter.sendMail({
        from: config.from,
        to: options.to,
        subject: options.subject,

        text: options.text,

        html: options.html
      });

    Logger.info(
      `[EmailService] تم إرسال الإيميل بنجاح إلى ${options.to}. ` +
      `Message ID: ${info.messageId}`
    );

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err: any) {
    Logger.error(
      `[EmailService] فشل إرسال الإيميل إلى ${options.to}:`,
      err?.message || err
    );

    throw new Error(
      'للأسف فشل إرسال البريد الإلكتروني، تأكد من إعدادات السيرفر وحاول مرة تانية.'
    );
  }
}

/**
 * ============================================================
 * PASSWORD RESET EMAIL TEMPLATE
 * ============================================================
 */
export function buildPasswordResetEmailTemplate(
  params: {
    userName: string;
    resetUrl: string;
    expiresInMinutes: number;
  }
): {
  html: string;
  text: string;
} {
  const {
    userName,
    resetUrl,
    expiresInMinutes
  } = params;

  const safeUserName =
    escapeHtml(userName);

  const safeResetUrl =
    escapeHtml(resetUrl);

  const currentYear =
    new Date().getFullYear();

  /**
   * ==========================================================
   * HTML EMAIL
   * ==========================================================
   */
  const html = `<!DOCTYPE html>
<html
  lang="ar"
  dir="rtl"
>
<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    http-equiv="X-UA-Compatible"
    content="IE=edge"
  >

  <title>
    إعادة تعيين كلمة السر | وه
  </title>

  <style>

    html,
    body {
      width: 100%;
      min-height: 100%;
      margin: 0 !important;
      padding: 0 !important;
      background-color: #eee8dc;
    }

    body {
      direction: rtl;
      text-align: right;
      color: #211d18;

      font-family:
        Tahoma,
        Arial,
        "Segoe UI",
        sans-serif;

      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-collapse: collapse;
      border-spacing: 0;
    }

    img {
      border: 0;
      outline: none;
      text-decoration: none;
      display: block;
    }

    a {
      text-decoration: none;
    }

    .email-page {
      width: 100%;
      box-sizing: border-box;

      padding: 40px 16px;

      background-color: #eee8dc;
    }

    .email-container {
      width: 100%;
      max-width: 650px;

      margin: 0 auto;
    }

    /* ========================================================
       HEADER
       ======================================================== */

    .header {
      background-color: #9a6a35;

      border-radius:
        24px 24px 0 0;

      padding:
        42px 25px 38px;

      text-align: center;
    }

    .logo-container {
      width: 220px;
      height: 220px;

      margin:
        0 auto 24px;

      padding: 14px;

      box-sizing: border-box;

      background-color: #ffffff;

      border-radius: 24px;

      box-shadow:
        0 12px 30px
        rgba(33, 29, 24, 0.16);
    }

    .logo {
      width: 100%;
      height: 100%;

      object-fit: contain;

      border-radius: 16px;
    }

    .brand-name {
      margin: 0;

      color: #ffffff;

      font-size: 31px;
      font-weight: 900;

      line-height: 1.5;
    }

    .brand-en {
      display: block;

      margin-top: 0;

      color: #f6ede3;

      font-size: 12px;
      font-weight: 700;

      letter-spacing: 5px;

      direction: ltr;
    }

    .brand-tagline {
      margin:
        12px 0 0;

      color: #f6ede3;

      font-size: 13px;

      line-height: 1.8;
    }

    /* ========================================================
       MAIN CONTENT
       ======================================================== */

    .content {
      background-color: #ffffff;

      padding:
        48px 45px;

      border-left:
        1px solid rgba(0, 0, 0, 0.1);

      border-right:
        1px solid rgba(0, 0, 0, 0.1);

      text-align: right;

      direction: rtl;
    }

    .hello {
      margin:
        0 0 20px;

      color: #211d18;

      font-size: 27px;
      font-weight: 900;

      line-height: 1.7;
    }

    .hello-name {
      color: #9a6a35;
    }

    .paragraph {
      margin:
        0 0 14px;

      color: #4a4137;

      font-size: 15px;

      line-height: 2;
    }

    .paragraph strong {
      color: #9a6a35;
    }

    /* ========================================================
       CTA
       ======================================================== */

    .cta {
      margin:
        34px 0;

      padding:
        30px 24px;

      background-color: #f6ede3;

      border:
        1px solid
        rgba(154, 106, 53, 0.12);

      border-radius: 16px;

      text-align: center;
    }

    .cta-title {
      margin:
        0 0 8px;

      color: #211d18;

      font-size: 17px;
      font-weight: 900;

      line-height: 1.7;
    }

    .cta-text {
      margin:
        0 0 23px;

      color: #6e6255;

      font-size: 12px;

      line-height: 1.9;
    }

    .button {
      display: inline-block;

      padding:
        17px 40px;

      background-color: #9a6a35;

      border:
        1px solid #9a6a35;

      border-radius: 12px;

      color: #ffffff !important;

      font-size: 16px;

      font-weight: 900;

      line-height: 1.4;

      box-shadow:
        0 8px 24px
        rgba(154, 106, 53, 0.25);
    }

    .button-note {
      display: block;

      margin-top: 12px;

      color: #6e6255;

      font-size: 11px;

      line-height: 1.7;
    }

    /* ========================================================
       SECURITY
       ======================================================== */

    .security {
      margin:
        28px 0;

      padding:
        20px 22px;

      background-color: #f6ede3;

      border:
        1px solid
        rgba(0, 0, 0, 0.06);

      border-right:
        5px solid #9a6a35;

      border-radius: 12px;

      text-align: right;

      direction: rtl;
    }

    .security-title {
      margin:
        0 0 8px;

      color: #9a6a35;

      font-size: 14px;

      font-weight: 900;

      line-height: 1.7;
    }

    .security-text {
      margin: 0;

      color: #4a4137;

      font-size: 13px;

      line-height: 1.95;
    }

    .expiry {
      color: #9a6a35;

      font-weight: 900;
    }

    /* ========================================================
       DIVIDER
       ======================================================== */

    .divider {
      width: 100%;

      height: 1px;

      margin:
        32px 0;

      background-color:
        rgba(0, 0, 0, 0.06);
    }

    /* ========================================================
       FALLBACK URL
       ======================================================== */

    .url-title {
      margin:
        0 0 8px;

      color: #211d18;

      font-size: 14px;

      font-weight: 900;

      line-height: 1.7;
    }

    .url-description {
      margin:
        0 0 12px;

      color: #6e6255;

      font-size: 12px;

      line-height: 1.8;
    }

    .url-box {
      width: 100%;

      box-sizing: border-box;

      padding: 14px;

      background-color: #eee8dc;

      border:
        1px solid
        rgba(0, 0, 0, 0.1);

      border-radius: 8px;

      color: #4a4137;

      font-size: 11px;

      line-height: 1.8;

      word-break: break-all;

      direction: ltr;

      text-align: left;

      font-family:
        Arial,
        sans-serif;
    }

    /* ========================================================
       IGNORE MESSAGE
       ======================================================== */

    .ignore {
      margin-top: 25px;

      padding:
        18px 20px;

      background-color: #eee8dc;

      border:
        1px solid
        rgba(0, 0, 0, 0.06);

      border-radius: 12px;
    }

    .ignore-text {
      margin: 0;

      color: #6e6255;

      font-size: 12px;

      line-height: 1.95;
    }

    /* ========================================================
       FOOTER
       ======================================================== */

    .footer {
      background-color: #211d18;

      border-radius:
        0 0 24px 24px;

      padding:
        32px 25px;

      text-align: center;
    }

    .footer-brand {
      margin: 0;

      color: #ffffff;

      font-size: 20px;

      font-weight: 900;

      line-height: 1.6;
    }

    .footer-description {
      max-width: 470px;

      margin:
        10px auto 0;

      color: #e4ddd1;

      font-size: 11px;

      line-height: 1.9;
    }

    .footer-line {
      width: 50px;

      height: 2px;

      margin:
        18px auto;

      background-color: #9a6a35;
    }

    .copyright {
      margin: 0;

      color: #6e6255;

      font-size: 10px;

      line-height: 1.9;
    }

    /* ========================================================
       MOBILE
       ======================================================== */

    @media only screen and (max-width: 600px) {

      .email-page {
        padding:
          12px 6px !important;
      }

      .header {
        padding:
          30px 18px !important;
      }

      .logo-container {
        width: 175px !important;
        height: 175px !important;

        padding: 11px !important;

        border-radius: 20px !important;
      }

      .brand-name {
        font-size: 27px !important;
      }

      .content {
        padding:
          35px 20px !important;
      }

      .hello {
        font-size: 23px !important;
      }

      .paragraph {
        font-size: 14px !important;
      }

      .cta {
        padding:
          25px 16px !important;
      }

      .button {
        display: block !important;

        padding:
          17px 15px !important;
      }

      .footer {
        padding:
          28px 18px !important;
      }
    }

  </style>

</head>

<body
  dir="rtl"
  style="
    margin:0;
    padding:0;
    width:100%;
    background-color:#eee8dc;
    direction:rtl;
    text-align:right;
  "
>

  <div
    class="email-page"
    dir="rtl"
  >

    <div class="email-container">

      <!-- =====================================================
           HEADER
           ===================================================== -->

      <div class="header">

        <div class="logo-container">

          <img
            class="logo"
            src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
            alt="شعار وه | WAH"
          >

        </div>

        <p class="brand-name">
          وه

          <span class="brand-en">
            WAH
          </span>
        </p>

        <p class="brand-tagline">
          العالم الرقمي لصعيد مصر
        </p>

      </div>


      <!-- =====================================================
           CONTENT
           ===================================================== -->

      <div
        class="content"
        dir="rtl"
      >

        <h1 class="hello">

          أهلاً بيك

          <span class="hello-name">
            يا ${safeUserName}
          </span>

        </h1>


        <p class="paragraph">

          إحنا وصلنا لنا طلب لإعادة تعيين كلمة السر
          الخاصة بحسابك على
          <strong>وه | WAH</strong>.

        </p>


        <p class="paragraph">

          لو إنت اللي طلبت تغيير كلمة السر،
          دوس على الزرار اللي تحت واختار كلمة سر جديدة
          لحسابك بكل سهولة.

        </p>


        <!-- ===================================================
             CTA
             =================================================== -->

        <div class="cta">

          <p class="cta-title">
            جاهز تغيّر كلمة السر؟
          </p>

          <p class="cta-text">
            دوس على الزرار ده وهتروح مباشرة لصفحة
            تغيير كلمة السر.
          </p>

          <a
            href="${safeResetUrl}"
            target="_blank"
            class="button"
            style="
              display:inline-block;
              background-color:#9a6a35;
              color:#ffffff;
              padding:17px 40px;
              border-radius:12px;
              font-size:16px;
              font-weight:900;
              line-height:1.4;
              text-decoration:none;
            "
          >
            تغيير كلمة السر
          </a>

          <span class="button-note">
            اضغط على الزرار علشان تكمل
          </span>

        </div>


        <!-- ===================================================
             SECURITY
             =================================================== -->

        <div class="security">

          <p class="security-title">
            🔐 خليك مطمّن
          </p>

          <p class="security-text">

            رابط تغيير كلمة السر ده معمول مخصوص
            علشان حسابك، وصالح لمدة

            <span class="expiry">
              ${expiresInMinutes} دقيقة
            </span>

            بس.

            بعد المدة دي، الرابط مش هيشتغل
            وهتحتاج تطلب رابط جديد.

          </p>

        </div>


        <!-- ===================================================
             FALLBACK URL
             =================================================== -->

        <div class="divider"></div>


        <p class="url-title">
          الزرار مش شغال؟
        </p>


        <p class="url-description">

          ولا يهمك، انسخ الرابط ده وحطه
          في متصفح الإنترنت عندك:

        </p>


        <div class="url-box">
          ${safeResetUrl}
        </div>


        <!-- ===================================================
             IGNORE
             =================================================== -->

        <div class="ignore">

          <p class="ignore-text">

            لو إنت ما طلبتش تغيير كلمة السر،
            متقلقش خالص وماتعملش أي حاجة.

            تجاهل الرسالة دي بأمان،
            وكلمة السر بتاعتك هتفضل زي ما هي.

          </p>

        </div>

      </div>


      <!-- =====================================================
           FOOTER
           ===================================================== -->

      <div class="footer">

        <p class="footer-brand">
          وه | WAH
        </p>


        <p class="footer-description">

          منصة بتحكي حكايات الصعيد،
          وبتجمع الأماكن والناس والأكل والحرف
          والتراث في مكان واحد.

        </p>


        <div class="footer-line"></div>


        <p class="copyright">

          © ${currentYear} وه | WAH

          <br>

          جميع الحقوق محفوظة

        </p>

      </div>

    </div>

  </div>

</body>
</html>`;

  /**
   * ==========================================================
   * PLAIN TEXT FALLBACK
   * ==========================================================
   */
  const text = `
أهلاً بيك يا ${userName}

إحنا وصلنا لنا طلب لإعادة تعيين كلمة السر الخاصة بحسابك على وه | WAH.

لو إنت اللي طلبت تغيير كلمة السر، استخدم الرابط ده:

${resetUrl}

الرابط صالح لمدة ${expiresInMinutes} دقيقة بس.

لو إنت ما طلبتش تغيير كلمة السر، متقلقش. تجاهل الرسالة دي بأمان، وكلمة السر بتاعتك هتفضل زي ما هي.

وه | WAH
العالم الرقمي لصعيد مصر

© ${currentYear} جميع الحقوق محفوظة
`.trim();

  return {
    html,
    text
  };
}

/**
 * ============================================================
 * ESCAPE HTML
 * ============================================================
 */
function escapeHtml(
  str: string
): string {
  if (!str) {
    return '';
  }

  return str
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}

/**
 * ============================================================
 * SEND PASSWORD RESET EMAIL
 * ============================================================
 */
export async function sendPasswordResetEmail(
  params: PasswordResetEmailParams
): Promise<{
  success: boolean;
  simulated?: boolean;
}> {

  const expiresInMinutes =
    params.expiresInMinutes || 30;

  const {
    html,
    text
  } =
    buildPasswordResetEmailTemplate({
      userName:
        params.userName,

      resetUrl:
        params.resetUrl,

      expiresInMinutes
    });

  return sendEmail({

    to: params.to,

    subject:
      '🔐 تغيير كلمة السر بتاعتك | وه WAH',

    html,

    text
  });
}