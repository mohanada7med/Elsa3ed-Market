import React, { useEffect } from 'react';
import { CraftReel } from '../../types.ts';
import { ReelFeed } from './reels/ReelFeed.tsx';
import { AnimatePresence, motion } from 'motion/react';

interface CraftReelsModalProps {
  reels: CraftReel[];
  initialReelId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
  onSelectSeller?: (sellerId: string) => void;
  onDeleteReel?: (reelId: string) => void;
  hasBottomNav?: boolean;
}

export const CraftReelsModal: React.FC<CraftReelsModalProps> = ({
  reels,
  initialReelId,
  isOpen,
  onClose,
  onSelectProduct,
  onSelectSeller,
  onDeleteReel,
  hasBottomNav = false
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || reels.length === 0) return null;

  return (
    <AnimatePresence>
      <div
        id="craft-reels-modal-overlay"
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex items-center justify-center select-none"
        style={{
          height: '100dvh',
          maxHeight: '100dvh',
          overscrollBehavior: 'contain'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full h-full flex items-center justify-center overflow-hidden relative"
        >
          <ReelFeed
            reels={reels}
            initialReelId={initialReelId}
            onSelectProduct={onSelectProduct}
            onSelectSeller={onSelectSeller}
            onDeleteReel={onDeleteReel}
            onClose={onClose}
            showCloseButton={true}
            hasBottomNav={hasBottomNav}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};