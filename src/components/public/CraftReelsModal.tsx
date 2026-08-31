import React from 'react';
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
}

export const CraftReelsModal: React.FC<CraftReelsModalProps> = ({
  reels,
  initialReelId,
  isOpen,
  onClose,
  onSelectProduct,
  onSelectSeller,
  onDeleteReel
}) => {
  if (!isOpen || reels.length === 0) return null;

  return (
    <AnimatePresence>
      <div
        id="craft-reels-modal-overlay"
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
        style={{ height: '100dvh' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full h-full flex items-center justify-center"
        >
          <ReelFeed
            reels={reels}
            initialReelId={initialReelId}
            onSelectProduct={onSelectProduct}
            onSelectSeller={onSelectSeller}
            onDeleteReel={onDeleteReel}
            onClose={onClose}
            showCloseButton={true}
            hasBottomNav={false}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
