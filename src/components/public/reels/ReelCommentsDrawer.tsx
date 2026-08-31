import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext.tsx';
import { CraftReel, CraftReelComment } from '../../../types.ts';
import { craftReelsService } from '../../../services/craftReelsService.ts';
import { X, Send, MessageCircle, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReelCommentsDrawerProps {
  reel: CraftReel;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: (newComment: CraftReelComment) => void;
}

export const ReelCommentsDrawer: React.FC<ReelCommentsDrawerProps> = ({
  reel,
  isOpen,
  onClose,
  onCommentAdded
}) => {
  const { currentUser, isAuthenticated, addToast } = useApp();
  const [comments, setComments] = useState<CraftReelComment[]>(reel.comments || []);
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setComments(reel.comments || []);
  }, [reel.comments, reel.id]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const created = craftReelsService.addComment(reel.id, {
      userName:
        currentUser?.name ||
        (isAuthenticated ? 'مستخدم سوق الصعيد' : 'محب للتراث الصعيدي'),
      userAvatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      governorate: currentUser?.governorate || 'الصعيد',
      comment: commentText.trim()
    });

    setComments((prev) => [created, ...prev]);
    setCommentText('');
    if (onCommentAdded) {
      onCommentAdded(created);
    }
    addToast('تم نشر التعليق', 'شكراً لدعمك وتشجيعك لصناع وتراث الصعيد!', 'success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs z-40"
          />

          {/* Sliding Bottom Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-50 h-[65%] sm:h-[60%] max-h-[500px] bg-[#1E1916] text-white rounded-t-3xl border-t border-white/15 shadow-2xl flex flex-col justify-between overflow-hidden"
            dir="rtl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  التعليقات ({comments.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="إغلاق التعليقات"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 text-right">
                    <img
                      src={
                        c.userAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={c.userName}
                      className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0 bg-neutral-800"
                    />
                    <div className="flex-1 bg-white/5 rounded-2xl p-2.5 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">
                          {c.userName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {c.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed">
                        {c.comment}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-8">
                  <MessageCircle className="w-8 h-8 text-gray-500" />
                  <p className="text-xs">لا توجد تعليقات بعد. كن أول من يشجع الأسطى!</p>
                </div>
              )}
            </div>

            {/* Comment Input Box */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-white/10 bg-[#161210] flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="اكتب كلمة تشجيع أو استفسار للصانع..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder-gray-400 outline-none focus:border-amber-400 transition-colors"
                maxLength={300}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2.5 bg-[#B45F42] hover:bg-[#9E4F36] disabled:opacity-40 disabled:hover:bg-[#B45F42] text-white rounded-xl transition-all cursor-pointer shrink-0"
                aria-label="إرسال التعليق"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
