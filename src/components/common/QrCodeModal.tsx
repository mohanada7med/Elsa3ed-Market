import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';

interface QrCodeModalProps {
  title: string;
  url: string;
  entityLabel: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ title, url, entityLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState('');
  const absoluteUrl = typeof window !== 'undefined' ? new URL(url, window.location.origin).toString() : url;

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setQrDataUrl('');
    setError('');
    QRCode.toDataURL(absoluteUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 1024,
      color: { dark: '#1B1009', light: '#FFFFFF' },
    })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch((qrError: unknown) => {
        console.error('[QrCodeModal] Failed to generate QR code:', qrError);
        if (active) setError('تعذر إنشاء رمز QR. حاول مرة أخرى.');
      });

    return () => {
      active = false;
    };
  }, [isOpen, absoluteUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border-subtle bg-surface-subtle px-3 transition hover:border-primary/30 hover:text-primary sm:px-4"
        aria-label={`إنشاء رمز QR لـ${entityLabel}`}
        title={`إنشاء رمز QR لـ${entityLabel}`}
      >
        <QrCode className="h-4 w-4" />
        <span className="text-[11px] font-black">رمز QR</span>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="qr-print-root fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <style>{`
            @media print {
              @page { size: A4; margin: 15mm; }
              body * { visibility: hidden !important; }
              .qr-print-root, .qr-print-root * { visibility: visible !important; }
              .qr-print-root {
                position: fixed !important;
                inset: 0 !important;
                z-index: 99999 !important;
                display: grid !important;
                place-items: center !important;
                overflow: visible !important;
                padding: 0 !important;
                background: #fff !important;
              }
              .qr-no-print { display: none !important; }
              .qr-print-card {
                width: 100% !important;
                max-width: none !important;
                border: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                color: #1B1009 !important;
              }
              .qr-print-card img { width: 75mm !important; height: 75mm !important; }
            }
          `}</style>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-code-title"
            className="qr-print-card w-full max-w-md rounded-3xl border border-primary/20 bg-background p-5 text-foreground shadow-2xl sm:p-7"
            dir="rtl"
          >
            <div className="qr-no-print mb-4 flex items-center justify-between">
              <div>
                <h2 id="qr-code-title" className="text-lg font-black">رمز QR جاهز للطباعة</h2>
                <p className="mt-1 text-xs font-semibold text-foreground-secondary">
                  امسح الرمز لفتح {entityLabel} مباشرة على منصة وه.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/10"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-primary/10 bg-white p-5 text-center text-[#1B1009]">
              <img
                src={qrDataUrl || undefined}
                alt={`رمز QR لـ${title}`}
                className="h-64 w-64 max-w-full object-contain"
              />
              <p className="mt-3 text-lg font-black">{title}</p>
              <p className="mt-1 break-all text-xs text-[#59483B]">{absoluteUrl}</p>
              <p className="mt-3 text-[10px] font-bold text-[#8B5528]">امسح الرمز واكتشف {entityLabel} على وه</p>
            </div>

            {error && <p role="alert" className="mt-3 text-center text-sm font-bold text-red-600">{error}</p>}

            <div className="qr-no-print mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!qrDataUrl}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Printer size={16} />
                طباعة
              </button>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`wah-${entityLabel}-qr.png`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/20 px-5 text-sm font-black text-primary hover:bg-primary/5"
                >
                  <Download size={16} />
                  تنزيل الصورة
                </a>
              )}
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  );
};
