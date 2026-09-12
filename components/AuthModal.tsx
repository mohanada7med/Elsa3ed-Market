import React, { useEffect } from 'react';
import { AuthModal } from '../src/components/auth/AuthModal';

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
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

export { AuthModal };
export default AuthModal;
