import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Square,
  QrCode,
  Loader2
} from 'lucide-react';
import QRCode from 'qrcode';

export interface SocialStoryCardProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'product' | 'quiz' | 'place' | 'seller';
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  badge?: string;
  governorate?: string;
  artisanName?: string;
  scoreText?: string;
  url?: string;
}

export const SocialStoryCardModal: React.FC<SocialStoryCardProps> = ({
  isOpen,
  onClose,
  type,
  title,
  subtitle,
  image,
  price,
  originalPrice,
  badge = 'تراث أصيل',
  governorate,
  artisanName,
  scoreText,
  url
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'story' | 'square'>('story');
  const [isRendering, setIsRendering] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://elsa3ed-market.com');

  // 1. Generate QR Code
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(targetUrl, {
      margin: 1,
      width: 240,
      color: {
        dark: '#1B1009',
        light: '#FFFFFF'
      }
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.warn('QR Code generation failed:', err));
  }, [isOpen, targetUrl]);

  // 2. Render High-Resolution Canvas
  const drawCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);

    const isStory = aspectRatio === 'story';
    const width = 1080;
    const height = isStory ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;

    // Helper: Rounded Rectangle
    const drawRoundRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fill = true,
      stroke = false
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    };

    // A. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1A0E08'); // Deep Espresso
    bgGrad.addColorStop(0.5, '#2A160C'); // Earth Terracotta
    bgGrad.addColorStop(1, '#120904'); // Dark Obsidian
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // B. Subtle Heritage Pattern Grid
    ctx.strokeStyle = 'rgba(201, 148, 68, 0.08)'; // Gold line
    ctx.lineWidth = 1.5;
    const step = 48;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // C. Outer Golden Border
    ctx.strokeStyle = 'rgba(201, 148, 68, 0.35)';
    ctx.lineWidth = 4;
    drawRoundRect(40, 40, width - 80, height - 80, 48, false, true);

    // Corner Ornaments
    ctx.fillStyle = '#C99444';
    const corners = [
      [40, 40],
      [width - 40, 40],
      [40, height - 40],
      [width - 40, height - 40]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // D. Header: Logo & Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C99444';
    ctx.font = 'bold 36px "Cairo", sans-serif';
    ctx.fillText('سُـوق الصَّـعِـيـد • مَنَصَّـة وَه', width / 2, isStory ? 140 : 110);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '500 24px "Cairo", sans-serif';
    ctx.fillText('تراث أصيل • بأيادي شيوخ الصنعة في الجنوب', width / 2, isStory ? 185 : 150);

    // E. Central Hero Image / Badge
    const cardX = 90;
    const cardY = isStory ? 240 : 190;
    const cardW = width - 180;
    const cardH = isStory ? 840 : 460;

    // Inner Card Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(201, 148, 68, 0.2)';
    ctx.lineWidth = 2;
    drawRoundRect(cardX, cardY, cardW, cardH, 36, true, true);

    // Load & Draw Image
    const imgSrc = image || (type === 'quiz' ? '/mascot/quiz.webp' : '/mascot/pro.webp');
    const imgObj = new Image();
    imgObj.crossOrigin = 'anonymous';

    await new Promise<void>((resolve) => {
      imgObj.onload = () => resolve();
      imgObj.onerror = () => resolve();
      imgObj.src = imgSrc;
    });

    if (imgObj.complete && imgObj.naturalWidth > 0) {
      ctx.save();
      const imgPadding = 24;
      const imgRadius = 28;
      const imgX = cardX + imgPadding;
      const imgY = cardY + imgPadding;
      const imgW = cardW - imgPadding * 2;
      const imgH = cardH - imgPadding * 2;

      drawRoundRect(imgX, imgY, imgW, imgH, imgRadius, false, false);
      ctx.clip();

      // Cover scaling
      const hRatio = imgW / imgObj.naturalWidth;
      const vRatio = imgH / imgObj.naturalHeight;
      const ratio = type === 'quiz' ? Math.min(hRatio, vRatio) : Math.max(hRatio, vRatio);
      const centerShiftX = (imgW - imgObj.naturalWidth * ratio) / 2;
      const centerShiftY = (imgH - imgObj.naturalHeight * ratio) / 2;

      ctx.drawImage(
        imgObj,
        0,
        0,
        imgObj.naturalWidth,
        imgObj.naturalHeight,
        imgX + centerShiftX,
        imgY + centerShiftY,
        imgObj.naturalWidth * ratio,
        imgObj.naturalHeight * ratio
      );
      ctx.restore();
    }

    // Top Badge (e.g. "عمدة الصعيد" or "صناعة يدوية 100%")
    const badgeText = badge || (type === 'quiz' ? 'شهادة عمدة الصعيد' : 'صناعة يدوية 100%');
    ctx.fillStyle = '#C99444';
    const badgeW = 320;
    const badgeH = 54;
    const badgeX = (width - badgeW) / 2;
    const badgeY = cardY - 26;
    drawRoundRect(badgeX, badgeY, badgeW, badgeH, 27, true, false);

    ctx.fillStyle = '#1A0E08';
    ctx.font = 'bold 24px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, width / 2, badgeY + 36);

    // F. Content Section
    let contentY = isStory ? 1160 : 700;

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px "Cairo", sans-serif';
    ctx.textAlign = 'center';

    // Truncate title if too long
    let displayTitle = title;
    if (ctx.measureText(displayTitle).width > width - 180) {
      while (ctx.measureText(displayTitle + '...').width > width - 180 && displayTitle.length > 0) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += '...';
    }
    ctx.fillText(displayTitle, width / 2, contentY);

    // Meta Subtitle / Governorate / Artisan
    contentY += 60;
    const metaParts: string[] = [];
    if (governorate) metaParts.push(`محافظة ${governorate}`);
    if (artisanName) metaParts.push(`صنع بيد: ${artisanName}`);
    if (scoreText) metaParts.push(`النتيجة: ${scoreText}`);
    const metaLine = metaParts.join('  •  ') || subtitle || 'مشغولات صعيدية أصلية';

    ctx.fillStyle = '#C99444';
    ctx.font = 'bold 28px "Cairo", sans-serif';
    ctx.fillText(metaLine, width / 2, contentY);

    // G. Price / Reward Tag (if product)
    if (price !== undefined && price > 0) {
      contentY += 75;
      const priceText = `${price.toLocaleString('ar-EG')} ج.م`;
      ctx.fillStyle = 'rgba(201, 148, 68, 0.15)';
      ctx.strokeStyle = '#C99444';
      ctx.lineWidth = 2;
      const pW = 280;
      const pH = 64;
      const pX = (width - pW) / 2;
      drawRoundRect(pX, contentY - 44, pW, pH, 32, true, true);

      ctx.fillStyle = '#FFF9EE';
      ctx.font = 'bold 36px "Cairo", sans-serif';
      ctx.fillText(priceText, width / 2, contentY);
    }

    // H. Footer: QR Code & Call to Action (in Story mode)
    if (isStory) {
      const footerY = 1580;

      // Bottom Card Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(201, 148, 68, 0.25)';
      ctx.lineWidth = 1.5;
      drawRoundRect(100, footerY, width - 200, 220, 32, true, true);

      // Draw QR Code
      if (qrDataUrl) {
        const qrImg = new Image();
        await new Promise<void>((resolve) => {
          qrImg.onload = () => resolve();
          qrImg.onerror = () => resolve();
          qrImg.src = qrDataUrl;
        });
        if (qrImg.complete && qrImg.naturalWidth > 0) {
          ctx.save();
          drawRoundRect(130, footerY + 25, 170, 170, 20, false, false);
          ctx.clip();
          ctx.drawImage(qrImg, 130, footerY + 25, 170, 170);
          ctx.restore();
        }
      }

      // QR Instruction Text
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px "Cairo", sans-serif';
      ctx.fillText('امسح الرمز لاكتشاف الحكاية ↗', width - 150, footerY + 90);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '500 24px "Cairo", sans-serif';
      ctx.fillText('تسوّق مباشرة من ورش الصعيد أو احجز رحلتك', width - 150, footerY + 140);
    }

    setIsRendering(false);
  }, [aspectRatio, badge, governorate, artisanName, image, price, qrDataUrl, scoreText, subtitle, title, type]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        drawCard();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, drawCard]);

  // Download Image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `wah-${type}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Direct Share via Web Share API
  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `wah-story.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title,
            text: `${title} — من منصة وه لسوق وتراث صعيد مصر`
          });
        } else if (navigator.share) {
          await navigator.share({
            title: title,
            text: `${title} — من منصة وه لسوق وتراث صعيد مصر`,
            url: targetUrl
          });
        } else {
          handleDownload();
        }
      }, 'image/png');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        handleDownload();
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        dir="rtl"
        className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative flex flex-col items-center max-w-[650px] w-full rounded-[2.5rem] bg-[#1E1109] border border-[#C99444]/30 shadow-2xl p-5 sm:p-8 text-white overflow-hidden my-auto"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="absolute left-5 top-5 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C99444]/20 border border-[#C99444]/30 text-[#C99444] text-xs font-bold mb-2">
              <Sparkles size={13} />
              <span>مشاركة بطاقة تراثية</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-main">
              صدّر بطاقة الستوري لصعيد مصر
            </h3>
            <p className="text-xs text-white/60 mt-1">
              صورة مصممة جاهزة للنشر فوراً على Instagram و WhatsApp Status و Facebook
            </p>
          </div>

          {/* Ratio Selector */}
          <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => setAspectRatio('story')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                aspectRatio === 'story'
                  ? 'bg-[#C99444] text-[#1A0E08] shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Smartphone size={15} />
              <span>ستوري (9:16)</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('square')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                aspectRatio === 'square'
                  ? 'bg-[#C99444] text-[#1A0E08] shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Square size={15} />
              <span>مربع (1:1)</span>
            </button>
          </div>

          {/* Canvas Preview Container */}
          <div className="relative w-full flex items-center justify-center max-h-[50vh] sm:max-h-[55vh] overflow-hidden rounded-2xl border-2 border-[#C99444]/20 shadow-xl bg-black/60 p-2">
            {isRendering && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs gap-2">
                <Loader2 className="w-8 h-8 text-[#C99444] animate-spin" />
                <span className="text-xs font-bold text-[#C99444]">جاري تجهيز بطاقة الصعيد...</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="max-h-[48vh] sm:max-h-[52vh] w-auto object-contain rounded-xl shadow-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full mt-6">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#E1306C] via-[#FD1D1D] to-[#F56040] hover:opacity-95 text-white font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Share2 size={16} />
              <span>مشاركة ستوري</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#C99444] hover:bg-white hover:text-[#1A0E08] text-[#1A0E08] font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Download size={16} />
              <span>تنزيل الصورة (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
