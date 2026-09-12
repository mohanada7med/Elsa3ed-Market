import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../../context/AppContext.tsx';
import {
  CraftReel,
  CraftReelComment,
} from '../../../types.ts';
import { craftReelsService } from '../../../services/craftReelsService.ts';
import {
  X,
  Send,
  MessageCircle,
} from 'lucide-react';
import {
  motion,
  AnimatePresence,
} from 'motion/react';

interface ReelCommentsDrawerProps {
  reel: CraftReel;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: (newComment: CraftReelComment) => void;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

export const ReelCommentsDrawer: React.FC<
  ReelCommentsDrawerProps
> = ({
  reel,
  isOpen,
  onClose,
  onCommentAdded,
}) => {
    const {
      currentUser,
      isAuthenticated,
      addToast,
    } = useApp();

    const [comments, setComments] = useState<CraftReelComment[]>(
      reel.comments || []
    );

    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    /*
     * Reset comments when the Reel changes.
     */
    useEffect(() => {
      setComments(reel.comments || []);
      setCommentText('');
    }, [reel.id, reel.comments]);

    /*
     * Load real comments when drawer opens.
     *
     * This makes the drawer independent from old localStorage data.
     */
    useEffect(() => {
      if (!isOpen || !reel.id) {
        return;
      }

      let cancelled = false;

      const loadComments = async () => {
        setIsLoading(true);

        try {
          const freshReel =
            await craftReelsService.fetchReelComments(reel.id);

          if (!cancelled && freshReel) {
            setComments(freshReel);
          }
        } catch (error) {
          console.error(
            '[ReelCommentsDrawer] Failed to load comments:',
            error
          );

          /*
           * Don't destroy already available comments
           * if the API temporarily fails.
           */
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      };

      loadComments();

      return () => {
        cancelled = true;
      };
    }, [isOpen, reel.id]);

    /*
     * Focus input when drawer opens.
     */
    useEffect(() => {
      if (!isOpen) {
        return;
      }

      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 250);

      return () => {
        window.clearTimeout(timer);
      };
    }, [isOpen]);

    /*
     * Submit real comment.
     */
    const handleSubmit = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      const text = commentText.trim();

      if (!text) {
        return;
      }

      if (isSubmitting) {
        return;
      }

      /*
       * Comments require authentication.
       */
      if (!isAuthenticated || !currentUser) {
        addToast(
          'سجل الدخول أولاً',
          'يجب تسجيل الدخول حتى تتمكن من إضافة تعليق.',
          'error'
        );

        return;
      }

      setIsSubmitting(true);

      try {
        /*
         * Send comment to API / MongoDB.
         */
        const created =
          await craftReelsService.addComment(
            reel.id,
            {
              userName:
                currentUser.name ||
                'مستخدم وه',

              userAvatar:
                currentUser.avatar ||
                DEFAULT_AVATAR,

              governorate:
                currentUser.governorate ||
                'الصعيد',

              comment: text,
            }
          );

        /*
         * Only add the comment after the server
         * successfully returns it.
         */
        setComments((prev) => [
          created,
          ...prev.filter(
            (comment) =>
              comment.id !== created.id
          ),
        ]);

        setCommentText('');

        onCommentAdded?.(created);

        addToast(
          'تم نشر التعليق',
          'شكراً لدعمك وتشجيعك لصناع وتراث الصعيد!',
          'success'
        );
      } catch (error) {
        console.error(
          '[ReelCommentsDrawer] Failed to publish comment:',
          error
        );

        addToast(
          'فشل نشر التعليق',
          'حدث خطأ أثناء إرسال التعليق، حاول مرة أخرى.',
          'error'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    /*
     * Prevent closing while clicking inside drawer.
     */
    const handleDrawerClick = (
      e: React.MouseEvent
    ) => {
      e.stopPropagation();
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
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="
              absolute
              inset-0
              z-40
              bg-black/60
              backdrop-blur-sm
            "
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                damping: 26,
                stiffness: 300,
              }}
              onClick={handleDrawerClick}
              className="
              absolute
              inset-x-0
              bottom-0
              z-50
              flex
              h-[65%]
              max-h-[560px]
              flex-col
              overflow-hidden
              rounded-t-3xl
              border-t
              border-white/15
              bg-[#1E1916]
              text-white
              shadow-2xl
              sm:h-[60%]
            "
              dir="rtl"
            >
              {/* Header */}
              <div
                className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-white/10
                px-4
                py-3
              "
              >
                <div className="flex items-center gap-2">
                  <MessageCircle
                    className="
                    h-4
                    w-4
                    text-[#d6aa72]
                  "
                  />

                  <h4
                    className="
                    text-xs
                    font-bold
                    text-white
                    sm:text-sm
                  "
                  >
                    التعليقات ({comments.length})
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="
                  cursor-pointer
                  rounded-full
                  p-1.5
                  text-gray-400
                  transition-colors
                  hover:bg-white/10
                  hover:text-white
                "
                  aria-label="إغلاق التعليقات"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Comments */}
              <div
                className="
                flex-1
                overflow-y-auto
                overscroll-contain
                px-4
                py-3
                scrollbar-thin
              "
                style={{
                  overscrollBehavior: 'contain',
                  overscrollBehaviorY: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                }}
              >
                {/* Loading */}
                {isLoading ? (
                  <div
                    className="
                    flex
                    h-full
                    flex-col
                    items-center
                    justify-center
                    gap-3
                    text-gray-400
                  "
                  >
                    <div
                      className="
                      h-7
                      w-7
                      animate-spin
                      rounded-full
                      border-2
                      border-white/20
                      border-t-amber-400
                    "
                    />

                    <p className="text-xs">
                      جاري تحميل التعليقات...
                    </p>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="
                        flex
                        items-start
                        gap-2.5
                        text-right
                      "
                      >
                        {/* Avatar */}
                        <img
                          src={comment.userAvatar || DEFAULT_AVATAR}
                          alt={comment.userName || 'مستخدم'}
                          className="
    h-8
    w-8
    shrink-0
    rounded-full
    border
    border-white/20
    bg-neutral-800
    object-cover
  "
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                        />
                        {/* Comment */}
                        <div
                          className="
                          min-w-0
                          flex-1
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/5
                          p-2.5
                        "
                        >
                          <div
                            className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                          >
                            <span
                              className="
                              truncate
                              text-xs
                              font-bold
                              text-amber-300
                            "
                            >
                              {comment.userName ||
                                'مستخدم'}
                            </span>


                          </div>

                          <p
                            className="
                            mt-1
                            break-words
                            text-xs
                            leading-relaxed
                            text-gray-200
                          "
                          >
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="
                    flex
                    h-full
                    flex-col
                    items-center
                    justify-center
                    space-y-2
                    py-8
                    text-center
                    text-gray-400
                  "
                  >
                    <MessageCircle
                      className="
                      h-8
                      w-8
                      text-gray-500
                    "
                    />

                    <p className="text-xs">
                      لا توجد تعليقات بعد.
                    </p>

                    <p
                      className="
                      text-[11px]
                      text-gray-500
                    "
                    >
                      كن أول من يشارك رأيه
                    </p>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="
                flex
                shrink-0
                items-center
                gap-2
                border-t
                border-white/10
                bg-[#161210]
                p-3
              "
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(
                      e.target.value
                    )
                  }
                  placeholder={
                    isAuthenticated
                      ? 'اكتب كلمة تشجيع أو استفسار...'
                      : 'سجل الدخول لإضافة تعليق...'
                  }
                  disabled={
                    !isAuthenticated ||
                    isSubmitting
                  }
                  maxLength={300}
                  autoComplete="off"
                  className="
                  min-w-0
                  flex-1
                  rounded-xl
                  border
                  border-white/15
                  bg-white/10
                  px-3
                  py-2.5
                  text-xs
                  text-white
                  outline-none
                  transition-colors
                  placeholder:text-gray-400
                  focus:border-amber-400
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                />

                <button
                  type="submit"
                  disabled={
                    !commentText.trim() ||
                    isSubmitting ||
                    !isAuthenticated
                  }
                  className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#9a6a35]
                  text-white
                  transition-all
                  hover:bg-[#83592c]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                  aria-label="إرسال التعليق"
                >
                  {isSubmitting ? (
                    <span
                      className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                    />
                  ) : (
                    <Send
                      className="
                      h-4
                      w-4
                      rotate-180
                    "
                    />
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };