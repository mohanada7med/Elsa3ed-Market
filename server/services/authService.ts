import { useEffect } from 'react';

export function RegisterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      // حفظ القيمة الأصلية ومنع التمرير
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      // إعادة التمرير عند إغلاق النافذة أو تفكيك المكون
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* محتوى نافذة التسجيل */}
    </div>
  );
}