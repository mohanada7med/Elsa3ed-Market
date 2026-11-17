import React, { useEffect, useRef } from 'react';
import { CraftReel } from '../../types';
import { ReelFeed } from './reels/ReelFeed';
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
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow === 'hidden' ? '' : (prevOverflow || '');
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Safety cleanup: guarantee body scroll is never left locked on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

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